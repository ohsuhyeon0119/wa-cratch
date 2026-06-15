# backend/app/ifc/quarantine.py
from __future__ import annotations
import json
from langchain_openai import ChatOpenAI
from .labels import IFCLabel
from .memory import LabeledValue, PlannerMemory


class SchemaNotAllowedError(ValueError):
    pass


def _validate_schema(output_schema: dict) -> str:
    """
    허용: boolean → "bool", integer → "int", string+enum → "enum[a,b,c]"
    거부: string (enum 없음), 그 외 타입
    """
    schema_type = output_schema.get("type")
    if schema_type == "boolean":
        return "bool"
    if schema_type == "integer":
        return "int"
    if schema_type == "string":
        if "enum" in output_schema:
            return f"enum[{','.join(str(v) for v in output_schema['enum'])}]"
        raise SchemaNotAllowedError(
            "string output schema is not allowed in quarantine LLM — use bool, int, or enum"
        )
    raise SchemaNotAllowedError(f"unsupported output schema type: {schema_type!r}")


async def query_llm(
    prompt: str,
    input_var: str,
    output_schema: dict,
    memory: PlannerMemory,
    model: ChatOpenAI,
) -> LabeledValue:
    """
    격리 LLM: tools 없이 비신뢰 변수 내용을 constrained decoding으로 분석.
    string output schema → SchemaNotAllowedError.
    결과 레이블: (input_label.integrity, input_label.confidentiality)
    """
    type_hint = _validate_schema(output_schema)

    var_name = input_var.lstrip("#")
    input_lv = memory.get(var_name)
    input_label = input_lv.label

    full_prompt = (
        f"{prompt}\n\nData:\n{json.dumps(input_lv.value, ensure_ascii=False, default=str)}"
    )

    json_schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "quarantine_result",
            "schema": {
                "type": "object",
                "properties": {"value": output_schema},
                "required": ["value"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    }
    structured_model = model.with_structured_output(json_schema, method="json_schema")
    raw = await structured_model(full_prompt)
    output_value = raw["value"] if isinstance(raw, dict) else raw

    result_label = IFCLabel(
        integrity=input_label.integrity,
        confidentiality=input_label.confidentiality,
    )
    return LabeledValue(value=output_value, label=result_label, type_hint=type_hint)
