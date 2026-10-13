from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class CamelModel(BaseModel):
    """snake_case in Python, camelCase in JSON. from_attributes lets schemas read ORM rows/objects."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int = Field(ge=0, description="Total rows matching the filter (ignoring limit/offset)")
    limit: int
    offset: int
