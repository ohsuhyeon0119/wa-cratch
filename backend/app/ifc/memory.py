# backend/app/ifc/memory.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Any
from .labels import IFCLabel, leq


@dataclass
class LabeledValue:
    value: Any
    label: IFCLabel
    type_hint: str | None = None


class PlannerMemory:
    def __init__(self) -> None:
        self._store: dict[str, LabeledValue] = {}
        self._counter: int = 0

    def store(self, name: str, value: Any, label: IFCLabel, type_hint: str | None = None) -> str:
        self._store[name] = LabeledValue(value=value, label=label, type_hint=type_hint)
        return f"#{name}"

    def get(self, name: str) -> LabeledValue:
        return self._store[name]

    def expand(self, args: dict) -> tuple[dict, dict[str, IFCLabel]]:
        expanded: dict = {}
        labels: dict[str, IFCLabel] = {}
        for k, v in args.items():
            if isinstance(v, str) and v.startswith("#"):
                var_name = v[1:]
                lv = self._store[var_name]
                expanded[k] = lv.value
                labels[k] = lv.label
            else:
                expanded[k] = v
        return expanded, labels

    def _fresh_name(self, tool_name: str) -> str:
        name = f"{tool_name}_{self._counter}"
        self._counter += 1
        return name


def hide(
    tool_name: str,
    tool_result: Any,
    result_label: IFCLabel,
    context_label: IFCLabel,
    memory: PlannerMemory,
) -> tuple[str, IFCLabel]:
    """
    HIDE (Algorithm 7, line 9):
    result_label ⊑ context_label → 직접 반환, context_label 유지
    result_label ⊄ context_label → 메모리 저장, #var_name 반환, context_label 유지
    """
    if leq(result_label, context_label):
        return str(tool_result), context_label
    var_name = memory._fresh_name(tool_name)
    memory.store(var_name, tool_result, result_label)
    return f"#{var_name}", context_label
