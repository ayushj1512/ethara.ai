CUSTOMER_DISCOUNT_RATE = 0.10


def money(value: float) -> float:
    return round(float(value or 0), 2)


def customer_discount(subtotal: float) -> float:
    return money(float(subtotal or 0) * CUSTOMER_DISCOUNT_RATE)


def discounted_total(subtotal: float) -> float:
    return money(float(subtotal or 0) - customer_discount(subtotal))
