# backend/tests/ifc/test_quarantine.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.ifc.labels import IFCLabel, IntegrityLevel, ConfidentialityLevel
from app.ifc.memory import PlannerMemory
from app.ifc.quarantine import query_llm, SchemaNotAllowedError

T, U = IntegrityLevel.T, IntegrityLevel.U
L, H = ConfidentialityLevel.L, ConfidentialityLevel.H

TL = IFCLabel(T, L)
UL = IFCLabel(U, L)


def _mem(value, label=None):
    label = label or UL
    mem = PlannerMemory()
    mem.store("test_var", value, label)
    return mem


class TestSchemaValidation:
    @pytest.mark.asyncio
    async def test_string_schema_rejected(self):
        with pytest.raises(SchemaNotAllowedError, match="string output schema"):
            await query_llm(
                prompt="Is this relevant?",
                input_var="#test_var",
                output_schema={"type": "string"},
                memory=_mem("data"),
                model=MagicMock(),
            )

    @pytest.mark.asyncio
    async def test_unsupported_type_rejected(self):
        with pytest.raises(SchemaNotAllowedError):
            await query_llm(
                prompt="p",
                input_var="#test_var",
                output_schema={"type": "array"},
                memory=_mem([]),
                model=MagicMock(),
            )


class TestQueryLlm:
    @pytest.mark.asyncio
    async def test_bool_schema_allowed(self):
        mock_model = MagicMock()
        mock_model.with_structured_output.return_value = AsyncMock(
            return_value={"value": True}
        )
        result = await query_llm(
            prompt="Does this start with wc_start?",
            input_var="#test_var",
            output_schema={"type": "boolean"},
            memory=_mem({"blocks": []}),
            model=mock_model,
        )
        assert result.value is True
        assert result.type_hint == "bool"

    @pytest.mark.asyncio
    async def test_int_schema_allowed(self):
        mock_model = MagicMock()
        mock_model.with_structured_output.return_value = AsyncMock(
            return_value={"value": 5}
        )
        result = await query_llm(
            prompt="Count the blocks",
            input_var="#test_var",
            output_schema={"type": "integer"},
            memory=_mem(42),
            model=mock_model,
        )
        assert result.value == 5
        assert result.type_hint == "int"

    @pytest.mark.asyncio
    async def test_enum_schema_allowed(self):
        mock_model = MagicMock()
        mock_model.with_structured_output.return_value = AsyncMock(
            return_value={"value": "move"}
        )
        result = await query_llm(
            prompt="Classify this block",
            input_var="#test_var",
            output_schema={"type": "string", "enum": ["move", "control", "sense"]},
            memory=_mem("some text"),
            model=mock_model,
        )
        assert result.value == "move"
        assert "enum" in result.type_hint
        assert "move" in result.type_hint

    @pytest.mark.asyncio
    async def test_result_label_inherits_input_integrity(self):
        mock_model = MagicMock()
        mock_model.with_structured_output.return_value = AsyncMock(
            return_value={"value": True}
        )
        result = await query_llm(
            prompt="Check",
            input_var="#test_var",
            output_schema={"type": "boolean"},
            memory=_mem("untrusted", label=UL),
            model=mock_model,
        )
        assert result.label.integrity == U

    @pytest.mark.asyncio
    async def test_trusted_input_gives_trusted_result(self):
        mock_model = MagicMock()
        mock_model.with_structured_output.return_value = AsyncMock(
            return_value={"value": True}
        )
        result = await query_llm(
            prompt="Check",
            input_var="#test_var",
            output_schema={"type": "boolean"},
            memory=_mem("trusted", label=TL),
            model=mock_model,
        )
        assert result.label.integrity == T
