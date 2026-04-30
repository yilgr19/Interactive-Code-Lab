"""
Genera todos los .glb temáticos en assets/ para Interactive Code Lab.

Temas (lógica de programación · 1.º semestre):
  1. FlujoLogicoAlgoritmo.glb   — diagramas, algoritmos y condicionales
  2. VariablesTipos.glb         — identificador + tipos (número, texto, booleano)
  3. OperadoresExpresion.glb    — operandos y operador → resultado
  4. BuclesIteracion.glb        — cuerpo central y repetición cíclica
  5. ArreglosListas.glb         — casillas indexadas 0..n
  6. FuncionesModulos.glb       — entrada → caja proceso → salida

Requisitos: pip install trimesh numpy scipy

Ejecutar desde la raíz del proyecto:
  python scripts/generar_modelos_logica.py
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


def export_scene(parts: list, path: str) -> None:
    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"n{i}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.export(path)
    print(f"OK: {path} ({os.path.getsize(path)} bytes)")


def build_flujo_logico() -> list:
    cyan = [34, 211, 238, 255]
    amber = [251, 191, 36, 255]
    emerald = [52, 211, 153, 255]
    slate = [148, 163, 184, 255]
    parts = []
    inicio = trimesh.creation.cylinder(radius=0.22, height=0.1, sections=24)
    inicio.visual.face_colors = np.tile(np.array(cyan, dtype=np.uint8), (len(inicio.faces), 1))
    inicio.apply_translation([0, 0.95, 0])
    parts.append(inicio)
    stem = trimesh.creation.cylinder(radius=0.04, height=0.22, sections=12)
    stem.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem.faces), 1))
    stem.apply_translation([0, 0.72, 0])
    parts.append(stem)
    arrow = trimesh.creation.cone(radius=0.1, height=0.14, sections=12)
    arrow.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(arrow.faces), 1))
    arrow.apply_translation([0, 0.58, 0])
    parts.append(arrow)
    decision = tinted_box([0.22, 0.22, 0.18], amber)
    decision.apply_transform(rotation_matrix(np.radians(45), [0, 0, 1]))
    decision.apply_translation([0, 0.32, 0])
    parts.append(decision)
    stem_t = trimesh.creation.cylinder(radius=0.035, height=0.2, sections=10)
    stem_t.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem_t.faces), 1))
    stem_t.apply_transform(rotation_matrix(np.radians(35), [0, 0, 1]))
    stem_t.apply_translation([-0.32, 0.02, 0])
    parts.append(stem_t)
    permitido = tinted_box([0.38, 0.12, 0.26], emerald)
    permitido.apply_translation([-0.62, -0.18, 0])
    parts.append(permitido)
    stem_f = trimesh.creation.cylinder(radius=0.035, height=0.2, sections=10)
    stem_f.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(stem_f.faces), 1))
    stem_f.apply_transform(rotation_matrix(np.radians(-35), [0, 0, 1]))
    stem_f.apply_translation([0.32, 0.02, 0])
    parts.append(stem_f)
    denegado = tinted_box([0.38, 0.12, 0.26], [248, 113, 113, 255])
    denegado.apply_translation([0.62, -0.18, 0])
    parts.append(denegado)
    base = tinted_box([1.6, 0.06, 0.5], [30, 41, 59, 255])
    base.apply_translation([0, -0.42, 0])
    parts.append(base)
    return parts


def build_variables_tipos() -> list:
    """Tres 'cajas de memoria' con colores distintos (int, string, bool)."""
    base = tinted_box([1.5, 0.08, 0.45], [30, 41, 59, 255])
    base.apply_translation([0, -0.2, 0])
    parts = [base]
    # número (azul)
    b_int = tinted_box([0.28, 0.22, 0.28], [59, 130, 246, 255])
    b_int.apply_translation([-0.48, 0.12, 0])
    parts.append(b_int)
    # texto (violeta)
    b_str = tinted_box([0.28, 0.22, 0.28], [167, 139, 250, 255])
    b_str.apply_translation([0, 0.12, 0])
    parts.append(b_str)
    # booleano (ámbar)
    b_bool = tinted_box([0.28, 0.22, 0.28], [250, 204, 21, 255])
    b_bool.apply_translation([0.48, 0.12, 0])
    parts.append(b_bool)
    for tx in [-0.48, 0, 0.48]:
        t = tinted_box([0.2, 0.04, 0.12], [100, 116, 139, 255])
        t.apply_translation([tx, 0.28, 0])
        parts.append(t)
    return parts


def build_operadores_expresion() -> list:
    """A [op] B → resultado (visual)."""
    base = tinted_box([1.45, 0.07, 0.4], [30, 41, 59, 255])
    base.apply_translation([0, -0.22, 0])
    parts = [base]
    a = trimesh.creation.icosphere(subdivisions=2, radius=0.14)
    a.visual.face_colors = np.tile(np.array([96, 165, 250, 255], dtype=np.uint8), (len(a.faces), 1))
    a.apply_translation([-0.52, 0.08, 0])
    parts.append(a)
    op = tinted_box([0.16, 0.2, 0.12], [251, 191, 36, 255])
    op.apply_translation([0, 0.1, 0])
    parts.append(op)
    b = trimesh.creation.icosphere(subdivisions=2, radius=0.14)
    b.visual.face_colors = np.tile(np.array([52, 211, 153, 255], dtype=np.uint8), (len(b.faces), 1))
    b.apply_translation([0.52, 0.08, 0])
    parts.append(b)
    res = tinted_box([0.22, 0.16, 0.18], [34, 211, 238, 255])
    res.apply_translation([0, -0.05, 0.28])
    parts.append(res)
    # conectores
    for x0, x1 in [(-0.38, -0.08), (0.08, 0.38)]:
        c = trimesh.creation.cylinder(radius=0.03, height=abs(x1 - x0), sections=8)
        c.visual.face_colors = np.tile(np.array([148, 163, 184, 255], dtype=np.uint8), (len(c.faces), 1))
        c.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
        c.apply_translation([(x0 + x1) / 2, 0.08, 0])
        parts.append(c)
    return parts


def build_bucles_iteracion() -> list:
    """Anillo de pasos + núcleo del cuerpo del bucle."""
    base = tinted_box([1.35, 0.07, 0.45], [30, 41, 59, 255])
    base.apply_translation([0, -0.28, 0])
    parts = [base]
    core = tinted_box([0.32, 0.28, 0.32], [34, 211, 238, 255])
    core.apply_translation([0, 0.08, 0])
    parts.append(core)
    r = 0.42
    cols = [[52, 211, 153, 255], [167, 139, 250, 255], [251, 191, 36, 255], [248, 113, 113, 255]]
    for i, ang in enumerate([0, 90, 180, 270]):
        rad = np.radians(ang)
        x, z = r * np.cos(rad), r * np.sin(rad)
        step = tinted_box([0.14, 0.12, 0.14], cols[i])
        step.apply_translation([float(x), 0.08, float(z)])
        parts.append(step)
    # arco decorativo (torus segment) — torus fino
    try:
        tor = trimesh.creation.torus(major_radius=r + 0.08, minor_radius=0.025, major_sections=48, minor_sections=12)
        tor.visual.face_colors = np.tile(np.array([71, 85, 105, 255], dtype=np.uint8), (len(tor.faces), 1))
        tor.apply_translation([0, 0.02, 0])
        parts.append(tor)
    except Exception:
        pass
    return parts


def build_arreglos_listas() -> list:
    """Cuatro casillas en fila (índices 0–3)."""
    base = tinted_box([1.4, 0.08, 0.38], [30, 41, 59, 255])
    base.apply_translation([0, -0.18, 0])
    parts = [base]
    xs = [-0.45, -0.15, 0.15, 0.45]
    colors = [[59, 130, 246, 255], [96, 165, 250, 255], [125, 211, 252, 255], [34, 211, 238, 255]]
    for i, x in enumerate(xs):
        cell = tinted_box([0.22, 0.18, 0.24], colors[i])
        cell.apply_translation([x, 0.1, 0])
        parts.append(cell)
        idx = tinted_box([0.12, 0.05, 0.08], [51, 65, 85, 255])
        idx.apply_translation([x, 0.22, 0])
        parts.append(idx)
    return parts


def build_funciones_modulos() -> list:
    """Entrada → módulo (caja negra) → salida."""
    base = tinted_box([1.5, 0.08, 0.42], [30, 41, 59, 255])
    base.apply_translation([0, -0.2, 0])
    parts = [base]
    inp = trimesh.creation.cone(radius=0.12, height=0.2, sections=16)
    inp.visual.face_colors = np.tile(np.array([96, 165, 250, 255], dtype=np.uint8), (len(inp.faces), 1))
    inp.apply_transform(rotation_matrix(np.radians(-90), [0, 0, 1]))
    inp.apply_translation([-0.58, 0.1, 0])
    parts.append(inp)
    mod = tinted_box([0.38, 0.26, 0.3], [15, 23, 42, 255])
    mod.apply_translation([0, 0.12, 0])
    parts.append(mod)
    out = trimesh.creation.cone(radius=0.12, height=0.2, sections=16)
    out.visual.face_colors = np.tile(np.array([52, 211, 153, 255], dtype=np.uint8), (len(out.faces), 1))
    out.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
    out.apply_translation([0.58, 0.1, 0])
    parts.append(out)
    return parts


def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    assets = os.path.join(root, "assets")
    export_scene(build_flujo_logico(), os.path.join(assets, "FlujoLogicoAlgoritmo.glb"))
    export_scene(build_variables_tipos(), os.path.join(assets, "VariablesTipos.glb"))
    export_scene(build_operadores_expresion(), os.path.join(assets, "OperadoresExpresion.glb"))
    export_scene(build_bucles_iteracion(), os.path.join(assets, "BuclesIteracion.glb"))
    export_scene(build_arreglos_listas(), os.path.join(assets, "ArreglosListas.glb"))
    export_scene(build_funciones_modulos(), os.path.join(assets, "FuncionesModulos.glb"))
    print("Listo: 6 modelos en assets/.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
