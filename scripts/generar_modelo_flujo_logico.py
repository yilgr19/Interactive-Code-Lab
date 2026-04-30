"""Compatibilidad: genera los 6 modelos (antes solo el flujo). Ejecuta el generador unificado."""
import importlib.util
import os
import sys

_here = os.path.dirname(os.path.abspath(__file__))
_path = os.path.join(_here, "generar_modelos_logica.py")
spec = importlib.util.spec_from_file_location("generar_modelos_logica", _path)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)
if __name__ == "__main__":
    try:
        mod.main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
