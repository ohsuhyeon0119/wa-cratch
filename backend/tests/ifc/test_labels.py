# backend/tests/ifc/test_labels.py
import pytest
from app.ifc.labels import (
    IntegrityLevel, ConfidentialityLevel, IFCLabel,
    join, leq, DataSource, get_source_label,
)

T, U = IntegrityLevel.T, IntegrityLevel.U
L, H = ConfidentialityLevel.L, ConfidentialityLevel.H


class TestJoin:
    def test_join_same_labels(self):
        assert join(IFCLabel(T, L), IFCLabel(T, L)) == IFCLabel(T, L)

    def test_join_integrity_dominance(self):
        assert join(IFCLabel(T, L), IFCLabel(U, L)) == IFCLabel(U, L)

    def test_join_confidentiality_dominance(self):
        assert join(IFCLabel(T, L), IFCLabel(T, H)) == IFCLabel(T, H)

    def test_join_both_dominance(self):
        assert join(IFCLabel(T, L), IFCLabel(U, H)) == IFCLabel(U, H)

    def test_join_commutative(self):
        a, b = IFCLabel(T, L), IFCLabel(U, H)
        assert join(a, b) == join(b, a)

    def test_join_associative(self):
        a, b, c = IFCLabel(T, L), IFCLabel(U, L), IFCLabel(T, H)
        assert join(join(a, b), c) == join(a, join(b, c))


class TestLeq:
    def test_leq_reflexive(self):
        assert leq(IFCLabel(T, L), IFCLabel(T, L))
        assert leq(IFCLabel(U, H), IFCLabel(U, H))

    def test_leq_trusted_below_untrusted(self):
        assert leq(IFCLabel(T, L), IFCLabel(U, L))

    def test_leq_low_below_high(self):
        assert leq(IFCLabel(T, L), IFCLabel(T, H))

    def test_leq_tl_below_uh(self):
        assert leq(IFCLabel(T, L), IFCLabel(U, H))

    def test_leq_incomparable_th_ul(self):
        assert not leq(IFCLabel(T, H), IFCLabel(U, L))
        assert not leq(IFCLabel(U, L), IFCLabel(T, H))

    def test_leq_untrusted_not_below_trusted(self):
        assert not leq(IFCLabel(U, L), IFCLabel(T, L))

    def test_leq_high_not_below_low(self):
        assert not leq(IFCLabel(T, H), IFCLabel(T, L))


class TestDataSourceLabels:
    def test_user_input_is_trusted_low(self):
        lbl = get_source_label(DataSource.USER_INPUT)
        assert lbl == IFCLabel(T, L)

    def test_own_project_is_trusted_low(self):
        lbl = get_source_label(DataSource.OWN_PROJECT)
        assert lbl == IFCLabel(T, L)

    def test_shared_project_is_untrusted_low(self):
        lbl = get_source_label(DataSource.SHARED_PROJECT)
        assert lbl == IFCLabel(U, L)

    def test_web_search_is_untrusted_low(self):
        lbl = get_source_label(DataSource.WEB_SEARCH)
        assert lbl == IFCLabel(U, L)

    def test_internal_is_trusted_low(self):
        lbl = get_source_label(DataSource.INTERNAL)
        assert lbl == IFCLabel(T, L)
