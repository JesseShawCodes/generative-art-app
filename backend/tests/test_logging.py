import json
import logging
import sys

from app.core.logging import JsonFormatter, configure_logging


def test_json_formatter_includes_extras_and_exc_info() -> None:
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test.logger",
        level=logging.ERROR,
        pathname=__file__,
        lineno=1,
        msg="boom %s",
        args=("here",),
        exc_info=None,
    )
    record.request_id = "req-1"  # type: ignore[attr-defined]
    record.method = "GET"  # type: ignore[attr-defined]
    record.path = "/health"  # type: ignore[attr-defined]
    record.status_code = 500  # type: ignore[attr-defined]
    record.duration_ms = 12.5  # type: ignore[attr-defined]

    try:
        raise ValueError("fail")
    except ValueError:
        record.exc_info = sys.exc_info()

    payload = json.loads(formatter.format(record))

    assert payload["level"] == "ERROR"
    assert payload["logger"] == "test.logger"
    assert payload["message"] == "boom here"
    assert payload["request_id"] == "req-1"
    assert payload["method"] == "GET"
    assert payload["path"] == "/health"
    assert payload["status_code"] == 500
    assert payload["duration_ms"] == 12.5
    assert "ValueError" in payload["exc_info"]
    assert "timestamp" in payload


def test_json_formatter_omits_missing_extras() -> None:
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="plain",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="hello",
        args=(),
        exc_info=None,
    )
    payload = json.loads(formatter.format(record))
    assert "request_id" not in payload
    assert "exc_info" not in payload
    assert payload["message"] == "hello"


def test_configure_logging_json_mode() -> None:
    configure_logging(level="debug", json_logs=True)
    root = logging.getLogger()
    assert root.level == logging.DEBUG
    assert len(root.handlers) == 1
    assert isinstance(root.handlers[0].formatter, JsonFormatter)
    assert logging.getLogger("uvicorn.access").level == logging.WARNING


def test_configure_logging_plain_mode() -> None:
    configure_logging(level="WARNING", json_logs=False)
    root = logging.getLogger()
    assert root.level == logging.WARNING
    formatter = root.handlers[0].formatter
    assert formatter is not None
    assert not isinstance(formatter, JsonFormatter)
