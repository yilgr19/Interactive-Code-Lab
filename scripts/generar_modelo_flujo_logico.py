"""
Genera assets/FlujoLogicoAlgoritmo.glb — diagrama 3D alineado con la Unidad 2.

Piezas (de arriba abajo; ver leyenda en index.html):
  - Cilindro cyan: inicio / entrada de datos (ej. edad).
  - Gris: conexión y flecha (secuencia).
  - Rombo ámbar: decisión (equivalente a if — en el reto: ¿edad >= 18?).
  - Rectángulo verde (izq.): rama verdadera → permitido.
  - Rectángulo rojo (der.): rama falsa → denegado.
  - Base oscura: cierre visual del diagrama.

Los hotspots del <model-viewer> usan posiciones en el mismo espacio del modelo.

Ejecutar desde la raíz: python scripts/generar_modelo_flujo_logico.py
"""
from __future__ import annotations

import os
import sys

import numpy as np
import trimesh
from trimesh.transformations import rotation_matrix


def tinted_box(extents, rgba):
    m = trimesh.creation.box(extents=extents)
    m.visual.face_colors = np.tile(np.array(rgba, dtype=np.uint8), (len(m.faces), 1))
    return m


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out = os.path.join(root, "assets", "FlujoLogicoAlgoritmo.glb")
    os.makedirs(os.path.dirname(out), exist_ok=True)

    # Paleta alineada con la UI (cyan / ámbar / esmeralda)
    cyan = [34, 211, 238, 255]
    amber = [251, 191, 36, 255]
    emerald = [52, 211, 153, 255]
    slate = [148, 163, 184, 255]

    parts = []

    # --- Inicio (óvalo aproximado: cilindro bajo) ---
    inicio = trimesh.creation.cylinder(radius=0.22, height=0.1, sections=24)
    inicio.visual.face_colors = np.tile(np.array(cyan, dtype=np.uint8), (len(inicio.faces), 1))
    inicio.apply_translation([0, 0.95, 0])
    parts.append(inicio)

    # Flecha hacia decisión (cono + cilindro)
    stem = trimesh.creation.cylinder(radius=0.04, height=0.22, sections=12)
    stem.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem.faces), 1))
    stem.apply_translation([0, 0.72, 0])
    parts.append(stem)
    arrow = trimesh.creation.cone(radius=0.1, height=0.14, sections=12)
    arrow.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(arrow.faces), 1))
    arrow.apply_translation([0, 0.58, 0])
    parts.append(arrow)

    # --- Decisión (rombo: caja rotada) ---
    decision = tinted_box([0.22, 0.22, 0.18], amber)
    decision.apply_transform(rotation_matrix(np.radians(45), [0, 0, 1]))
    decision.apply_translation([0, 0.32, 0])
    parts.append(decision)

    # --- Rama verdadera (≥ condición) → “Permitido” ---
    stem_t = trimesh.creation.cylinder(radius=0.035, height=0.2, sections=10)
    stem_t.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem_t.faces), 1))
    stem_t.apply_transform(rotation_matrix(np.radians(35), [0, 0, 1]))
    stem_t.apply_translation([-0.32, 0.02, 0])
    parts.append(stem_t)

    permitido = tinted_box([0.38, 0.12, 0.26], emerald)
    permitido.apply_translation([-0.62, -0.18, 0])
    parts.append(permitido)

    # --- Rama falsa → “Denegado” ---
    stem_f = trimesh.creation.cylinder(radius=0.035, height=0.2, sections=10)
    stem_f.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem_f.faces), 1))
    stem_f.apply_transform(rotation_matrix(np.radians(-35), [0, 0, 1]))
    stem_f.apply_translation([0.32, 0.02, 0])
    parts.append(stem_f)

    denegado = tinted_box([0.38, 0.12, 0.26], [248, 113, 113, 255])
    denegado.apply_translation([0.62, -0.18, 0])
    parts.append(denegado)

    # Base / “proceso” central opcional (suelo conceptual)
    base = tinted_box([1.6, 0.06, 0.5], [30, 41, 59, 255])
    base.apply_translation([0, -0.42, 0])
    parts.append(base)

    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"n{i}")

    scene.export(out)
    print(f"OK: {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
