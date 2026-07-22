import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import CredentialsException


def test_password_hashing():
    password = "secret_password_123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_access_token_creation_and_decoding():
    token = create_access_token(subject="test_user", role="admin")
    payload = decode_token(token)

    assert payload["sub"] == "test_user"
    assert payload["role"] == "admin"
    assert payload["type"] == "access"
    assert "exp" in payload


def test_refresh_token_creation_and_decoding():
    token = create_refresh_token(subject="test_user", role="analyst")
    payload = decode_token(token)

    assert payload["sub"] == "test_user"
    assert payload["role"] == "analyst"
    assert payload["type"] == "refresh"


def test_invalid_token_decoding():
    with pytest.raises(CredentialsException):
        decode_token("invalid.jwt.token")
