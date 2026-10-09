from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Python code uses snake_case; the JSON API (and the TypeScript client) uses camelCase."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
