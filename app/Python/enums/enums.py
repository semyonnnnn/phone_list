from enum import Enum

class Territory(str, Enum):
    ekb = "Екатеринбург"
    krg = "Курган"

    @classmethod
    def from_key(cls, key: str) -> "Territory | None":
        return cls.__members__.get(key.strip().lower())

    @property
    def sort_order(self) -> int:
        # ekb first (0), krg last (2), any unexpected values in between (1)
        order = {
            "ekb": 0,
            "krg": 2,
        }
        return order.get(self.name, 1)
