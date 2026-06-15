# backend/app/ifc/labels.py
from dataclasses import dataclass
from enum import Enum


class IntegrityLevel(Enum):
    T = "T"  # Trusted
    U = "U"  # Untrusted


class ConfidentialityLevel(Enum):
    L = "L"  # Low / public
    H = "H"  # High / secret


@dataclass(frozen=True)
class IFCLabel:
    integrity: IntegrityLevel
    confidentiality: ConfidentialityLevel


_I_ORD = {IntegrityLevel.T: 0, IntegrityLevel.U: 1}
_C_ORD = {ConfidentialityLevel.L: 0, ConfidentialityLevel.H: 1}
_I_BY_ORD = [IntegrityLevel.T, IntegrityLevel.U]
_C_BY_ORD = [ConfidentialityLevel.L, ConfidentialityLevel.H]


def join(l1: IFCLabel, l2: IFCLabel) -> IFCLabel:
    """Lattice join (⊔): least upper bound"""
    i = _I_BY_ORD[max(_I_ORD[l1.integrity], _I_ORD[l2.integrity])]
    c = _C_BY_ORD[max(_C_ORD[l1.confidentiality], _C_ORD[l2.confidentiality])]
    return IFCLabel(integrity=i, confidentiality=c)


def leq(l1: IFCLabel, l2: IFCLabel) -> bool:
    """Lattice ordering (⊑): l1 ⊑ l2 iff i1 ⊑ i2 AND c1 ⊑ c2"""
    return (
        _I_ORD[l1.integrity] <= _I_ORD[l2.integrity]
        and _C_ORD[l1.confidentiality] <= _C_ORD[l2.confidentiality]
    )


class DataSource(Enum):
    USER_INPUT = "user_input"
    OWN_PROJECT = "own_project"
    SHARED_PROJECT = "shared_project"
    WEB_SEARCH = "web_search"
    INTERNAL = "internal"


_SOURCE_LABELS: dict[DataSource, IFCLabel] = {
    DataSource.USER_INPUT:     IFCLabel(IntegrityLevel.T, ConfidentialityLevel.L),
    DataSource.OWN_PROJECT:    IFCLabel(IntegrityLevel.T, ConfidentialityLevel.L),
    DataSource.SHARED_PROJECT: IFCLabel(IntegrityLevel.U, ConfidentialityLevel.L),
    DataSource.WEB_SEARCH:     IFCLabel(IntegrityLevel.U, ConfidentialityLevel.L),
    DataSource.INTERNAL:       IFCLabel(IntegrityLevel.T, ConfidentialityLevel.L),
}


def get_source_label(source: DataSource) -> IFCLabel:
    return _SOURCE_LABELS[source]
