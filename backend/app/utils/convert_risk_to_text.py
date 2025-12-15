def convert_to_text(shutdown_risk: float) -> str:
    if shutdown_risk >= 0.7:
        return "HIGH"
    elif shutdown_risk >= 0.3:
        return "MEDIUM"
    return "LOW"