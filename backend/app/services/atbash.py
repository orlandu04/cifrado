"""Cifrado Atbash para el alfabeto latino básico (A-Z).

Atbash es una sustitución monoalfabética simétrica: cada letra se reemplaza
por su opuesta en el alfabeto de 26 letras (A <-> Z, B <-> Y, ...). Aplicarlo
dos veces devuelve el texto original. El texto se normaliza a mayúsculas y
solo se admiten letras ASCII sin Ñ: espacios, números, signos, acentos y
cualquier otro carácter producen un error.
"""

from __future__ import annotations

UPPER_A = ord("A")
UPPER_Z = ord("Z")


class AtbashError(ValueError):
    """El texto contiene caracteres fuera del alfabeto A-Z."""


def atbash(text: str) -> str:
    """Devuelve la transformación Atbash de ``text`` en mayúsculas."""
    transformed: list[str] = []

    for char in text:
        if "A" <= char <= "Z":
            code = ord(char)
        elif "a" <= char <= "z":
            code = ord(char.upper())
        else:
            raise AtbashError(
                "Solo se permiten letras A-Z, sin Ñ, espacios, números, "
                "signos ni acentos."
            )
        transformed.append(chr(UPPER_Z - (code - UPPER_A)))

    return "".join(transformed)
