# backend/tests/ifc/test_policy.py
import pytest
from app.ifc.labels import IFCLabel, IntegrityLevel, ConfidentialityLevel
from app.ifc.policy import (
    TrustedActionPolicy,
    PermittedFlowPolicy,
    PolicyViolation,
    PolicyEngine,
)

T, U = IntegrityLevel.T, IntegrityLevel.U
L, H = ConfidentialityLevel.L, ConfidentialityLevel.H

TL = IFCLabel(T, L)
UL = IFCLabel(U, L)
TH = IFCLabel(T, H)


class TestTrustedActionPolicy:
    def test_trusted_context_passes(self):
        policy = TrustedActionPolicy()
        assert policy.check("set_blocks", TL, {}) is None

    def test_untrusted_context_blocked(self):
        policy = TrustedActionPolicy()
        result = policy.check("set_blocks", UL, {})
        assert isinstance(result, PolicyViolation)
        assert result.tool_name == "set_blocks"
        assert "U" in result.reason

    def test_args_labels_ignored_by_pt(self):
        policy = TrustedActionPolicy()
        assert policy.check("set_blocks", TL, {"xml": UL}) is None


class TestPermittedFlowPolicy:
    def test_low_arg_allowed_to_low_recipient(self):
        policy = PermittedFlowPolicy(permitted_level=L)
        assert policy.check("send_data", TL, {"data": IFCLabel(T, L)}) is None

    def test_high_arg_blocked_to_low_recipient(self):
        policy = PermittedFlowPolicy(permitted_level=L)
        result = policy.check("send_data", TL, {"data": IFCLabel(T, H)})
        assert isinstance(result, PolicyViolation)
        assert "data" in result.reason

    def test_checked_args_filter(self):
        policy = PermittedFlowPolicy(permitted_level=L, checked_args=["safe"])
        result = policy.check(
            "send_data", TL,
            {"safe": IFCLabel(T, L), "secret": IFCLabel(T, H)},
        )
        assert result is None


class TestPolicyEngine:
    def test_set_blocks_trusted_passes(self):
        engine = PolicyEngine()
        assert engine.check("set_blocks", TL, {}) is None

    def test_set_blocks_untrusted_blocked(self):
        engine = PolicyEngine()
        result = engine.check("set_blocks", UL, {})
        assert isinstance(result, PolicyViolation)

    def test_append_blocks_untrusted_blocked(self):
        engine = PolicyEngine()
        assert isinstance(engine.check("append_blocks", UL, {}), PolicyViolation)

    def test_clear_workspace_untrusted_blocked(self):
        engine = PolicyEngine()
        assert isinstance(engine.check("clear_workspace", UL, {}), PolicyViolation)

    def test_get_project_context_no_policy(self):
        engine = PolicyEngine()
        assert engine.check("get_project_context", UL, {}) is None

    def test_get_block_reference_no_policy(self):
        engine = PolicyEngine()
        assert engine.check("get_block_reference", UL, {}) is None

    def test_get_user_info_no_policy(self):
        engine = PolicyEngine()
        assert engine.check("get_user_info", UL, {}) is None

    def test_unknown_tool_no_policy(self):
        engine = PolicyEngine()
        assert engine.check("unknown_tool", UL, {}) is None

    def test_custom_policies(self):
        custom = {"my_tool": [TrustedActionPolicy()]}
        engine = PolicyEngine(tool_policies=custom)
        assert isinstance(engine.check("my_tool", UL, {}), PolicyViolation)
        assert engine.check("set_blocks", UL, {}) is None
