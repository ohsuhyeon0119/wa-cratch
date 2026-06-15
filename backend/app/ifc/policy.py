# backend/app/ifc/policy.py
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from .labels import IFCLabel, IntegrityLevel, ConfidentialityLevel

_C_ORD = {ConfidentialityLevel.L: 0, ConfidentialityLevel.H: 1}


@dataclass
class PolicyViolation:
    tool_name: str
    reason: str


class Policy(ABC):
    @abstractmethod
    def check(
        self,
        tool_name: str,
        context_label: IFCLabel,
        args_labels: dict[str, IFCLabel],
    ) -> PolicyViolation | None: ...


class TrustedActionPolicy(Policy):
    """P-T: context_label.integrity must be T"""

    def check(
        self,
        tool_name: str,
        context_label: IFCLabel,
        args_labels: dict[str, IFCLabel],
    ) -> PolicyViolation | None:
        if context_label.integrity != IntegrityLevel.T:
            return PolicyViolation(
                tool_name=tool_name,
                reason=f"context integrity is {context_label.integrity.value}, must be T",
            )
        return None


class PermittedFlowPolicy(Policy):
    """P-F: checked_args confidentiality ⊑ permitted_level"""

    def __init__(
        self,
        permitted_level: ConfidentialityLevel,
        checked_args: list[str] | None = None,
    ):
        self._permitted = permitted_level
        self._checked_args = checked_args  # None = check all

    def check(
        self,
        tool_name: str,
        context_label: IFCLabel,
        args_labels: dict[str, IFCLabel],
    ) -> PolicyViolation | None:
        permitted_ord = _C_ORD[self._permitted]
        for arg_name, arg_label in args_labels.items():
            if self._checked_args is not None and arg_name not in self._checked_args:
                continue
            if _C_ORD[arg_label.confidentiality] > permitted_ord:
                return PolicyViolation(
                    tool_name=tool_name,
                    reason=(
                        f"arg '{arg_name}' confidentiality "
                        f"{arg_label.confidentiality.value} exceeds permitted "
                        f"{self._permitted.value}"
                    ),
                )
        return None


_PT = TrustedActionPolicy()

TOOL_POLICIES: dict[str, list[Policy]] = {
    "set_blocks":      [_PT],
    "append_blocks":   [_PT],
    "clear_workspace": [_PT],
}


class PolicyEngine:
    def __init__(self, tool_policies: dict[str, list[Policy]] | None = None):
        self.tool_policies = tool_policies if tool_policies is not None else TOOL_POLICIES

    def check(
        self,
        tool_name: str,
        context_label: IFCLabel,
        args_labels: dict[str, IFCLabel],
    ) -> PolicyViolation | None:
        for policy in self.tool_policies.get(tool_name, []):
            violation = policy.check(tool_name, context_label, args_labels)
            if violation:
                return violation
        return None
