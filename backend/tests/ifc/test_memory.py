# backend/tests/ifc/test_memory.py
import pytest
from app.ifc.labels import IFCLabel, IntegrityLevel, ConfidentialityLevel
from app.ifc.memory import LabeledValue, PlannerMemory, hide

T, U = IntegrityLevel.T, IntegrityLevel.U
L, H = ConfidentialityLevel.L, ConfidentialityLevel.H

TL = IFCLabel(T, L)
UL = IFCLabel(U, L)
TH = IFCLabel(T, H)
UH = IFCLabel(U, H)


class TestPlannerMemory:
    def test_store_returns_hash_ref(self):
        mem = PlannerMemory()
        ref = mem.store("x", "hello", TL)
        assert ref == "#x"

    def test_store_and_get(self):
        mem = PlannerMemory()
        mem.store("x", "hello", TL)
        lv = mem.get("x")
        assert lv.value == "hello"
        assert lv.label == TL

    def test_store_with_type_hint(self):
        mem = PlannerMemory()
        mem.store("flag", True, UL, type_hint="bool")
        lv = mem.get("flag")
        assert lv.type_hint == "bool"

    def test_expand_resolves_variable(self):
        mem = PlannerMemory()
        mem.store("ctx", {"data": 42}, UL)
        expanded, labels = mem.expand({"input": "#ctx"})
        assert expanded["input"] == {"data": 42}
        assert labels["input"] == UL

    def test_expand_plain_value_unchanged(self):
        mem = PlannerMemory()
        expanded, labels = mem.expand({"plain": "value"})
        assert expanded["plain"] == "value"
        assert "plain" not in labels

    def test_expand_mixed(self):
        mem = PlannerMemory()
        mem.store("v", 99, TL)
        expanded, labels = mem.expand({"ref": "#v", "literal": "abc"})
        assert expanded["ref"] == 99
        assert labels["ref"] == TL
        assert expanded["literal"] == "abc"
        assert "literal" not in labels


class TestHide:
    def test_trusted_result_in_trusted_context_direct(self):
        mem = PlannerMemory()
        content, new_label = hide("get_block_reference", "block_data", TL, TL, mem)
        assert content == "block_data"
        assert new_label == TL

    def test_untrusted_result_in_trusted_context_stored(self):
        mem = PlannerMemory()
        content, new_label = hide("get_project_context", {"blocks": []}, UL, TL, mem)
        assert content.startswith("#")
        assert new_label == TL  # context_label unchanged

    def test_context_label_never_raised(self):
        mem = PlannerMemory()
        _, ctx1 = hide("tool_a", "r1", UL, TL, mem)
        _, ctx2 = hide("tool_b", "r2", UL, ctx1, mem)
        assert ctx1 == TL
        assert ctx2 == TL

    def test_hidden_var_retrievable(self):
        mem = PlannerMemory()
        content, _ = hide("get_project_context", {"blocks": [1, 2]}, UL, TL, mem)
        var_name = content[1:]  # strip '#'
        lv = mem.get(var_name)
        assert lv.value == {"blocks": [1, 2]}
        assert lv.label == UL

    def test_untrusted_in_untrusted_context_direct(self):
        # UL ⊑ UL → 직접 반환
        mem = PlannerMemory()
        content, new_label = hide("tool", "data", UL, UL, mem)
        assert content == "data"
        assert new_label == UL

    def test_multiple_hides_generate_unique_names(self):
        mem = PlannerMemory()
        c1, _ = hide("tool", "r1", UL, TL, mem)
        c2, _ = hide("tool", "r2", UL, TL, mem)
        assert c1 != c2
