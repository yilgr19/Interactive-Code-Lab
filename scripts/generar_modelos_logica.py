"""
Genera .glb temáticos más explicativos para Interactive Code Lab.

Cada modelo usa formas reconocibles (bandeja de entrada, rombo de decisión,
marca ✓/✗, cilindro=número, lámina=texto, interruptor=bool, signo +, anillo
con flechas, casillas en escalera = índices, embudos+tuberías = función).

Niveles: N1 = Flujo + Variables | N2 = Operadores + Bucles | N3 = Arreglos + Funciones.

Ejecutar: python scripts/generar_modelos_logica.py
Requisitos: pip install trimesh numpy scipy
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


def tinted_cylinder(radius, height, rgba, sections=24):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    m.visual.face_colors = np.tile(np.array(rgba, dtype=np.uint8), (len(m.faces), 1))
    return m


def export_scene(parts: list, path: str) -> None:
    scene = trimesh.Scene()
    for i, p in enumerate(parts):
        scene.add_geometry(p, node_name=f"n{i}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.export(path)
    print(f"OK: {path} ({os.path.getsize(path)} bytes)")


def plus_shape_3d(size: float, rgba, y_center: float = 0.1) -> list:
    """Signo + con dos prismas (más reconocible que un cubo genérico)."""
    s = size
    v = tinted_box([s * 0.35, s * 0.9, s * 0.35], rgba)
    v.apply_translation([0, y_center, 0])
    h = tinted_box([s * 0.9, s * 0.35, s * 0.35], rgba)
    h.apply_translation([0, y_center, 0])
    return [v, h]


def build_flujo_logico() -> list:
    """
    Entrada (bandeja ancha) → flecha → ROMBO decisión grande →
    rama SÍ (bloque + marca ✓) / rama NO (bloque + aspas ✗).
    """
    cyan = [34, 211, 238, 255]
    amber = [251, 191, 36, 255]
    emerald = [52, 211, 153, 255]
    red = [248, 113, 113, 255]
    slate = [148, 163, 184, 255]
    dark = [30, 41, 59, 255]
    parts = []

    # Bandeja "ENTRADA / dato"
    bandeja = tinted_cylinder(0.28, 0.07, cyan, 32)
    bandeja.apply_translation([0, 0.92, 0])
    parts.append(bandeja)
    borde = tinted_cylinder(0.32, 0.025, [6, 182, 212, 255], 32)
    borde.apply_translation([0, 0.98, 0])
    parts.append(borde)

    stem = tinted_cylinder(0.045, 0.26, slate, 12)
    stem.apply_translation([0, 0.76, 0])
    parts.append(stem)
    arrow = trimesh.creation.cone(radius=0.11, height=0.16, sections=14)
    arrow.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(arrow.faces), 1))
    arrow.apply_translation([0, 0.58, 0])
    parts.append(arrow)

    # Rombo decisión (más grande)
    decision = tinted_box([0.28, 0.28, 0.22], amber)
    decision.apply_transform(rotation_matrix(np.radians(45), [0, 0, 1]))
    decision.apply_translation([0, 0.34, 0])
    parts.append(decision)
    # Punto central "pregunta"
    core = trimesh.creation.icosphere(subdivisions=1, radius=0.06)
    core.visual.face_colors = np.tile(np.array([254, 243, 199, 255], dtype=np.uint8), (len(core.faces), 1))
    core.apply_translation([0, 0.34, 0])
    parts.append(core)

    # Rama verdadera
    stem_t = tinted_cylinder(0.038, 0.22, slate, 10)
    stem_t.apply_transform(rotation_matrix(np.radians(32), [0, 0, 1]))
    stem_t.apply_translation([-0.34, 0.04, 0])
    parts.append(stem_t)
    permitido = tinted_box([0.42, 0.14, 0.28], emerald)
    permitido.apply_translation([-0.68, -0.16, 0])
    parts.append(permitido)
    # Marca tipo ✓ (dos prismas en V)
    chk1 = tinted_box([0.06, 0.12, 0.04], [167, 243, 208, 255])
    chk1.apply_transform(rotation_matrix(np.radians(-35), [0, 0, 1]))
    chk1.apply_translation([-0.78, 0.02, 0.12])
    parts.append(chk1)
    chk2 = tinted_box([0.06, 0.14, 0.04], [167, 243, 208, 255])
    chk2.apply_transform(rotation_matrix(np.radians(48), [0, 0, 1]))
    chk2.apply_translation([-0.62, 0.06, 0.12])
    parts.append(chk2)

    # Rama falsa
    stem_f = tinted_cylinder(0.038, 0.22, slate, 10)
    stem_f.apply_transform(rotation_matrix(np.radians(-32), [0, 0, 1]))
    stem_f.apply_translation([0.34, 0.04, 0])
    parts.append(stem_f)
    denegado = tinted_box([0.42, 0.14, 0.28], red)
    denegado.apply_translation([0.68, -0.16, 0])
    parts.append(denegado)
    # Aspas ✗
    x1 = tinted_box([0.22, 0.05, 0.05], [254, 202, 202, 255])
    x1.apply_transform(rotation_matrix(np.radians(45), [0, 1, 0]))
    x1.apply_translation([0.68, 0.06, 0.14])
    parts.append(x1)
    x2 = tinted_box([0.22, 0.05, 0.05], [254, 202, 202, 255])
    x2.apply_transform(rotation_matrix(np.radians(-45), [0, 1, 0]))
    x2.apply_translation([0.68, 0.06, 0.14])
    parts.append(x2)

    base = tinted_box([1.75, 0.07, 0.55], dark)
    base.apply_translation([0, -0.44, 0])
    parts.append(base)
    return parts


def build_variables_tipos() -> list:
    """
    Memoria compartida (base ranurada) + tres metáforas:
    cilindro alto = número, lámina ancha plana = texto, palanca pequeña = bool.
    """
    dark = [30, 41, 59, 255]
    groove = [51, 65, 85, 255]
    parts = []

    base = tinted_box([1.55, 0.09, 0.48], dark)
    base.apply_translation([0, -0.22, 0])
    parts.append(base)
    for gx in [-0.48, 0, 0.48]:
        g = tinted_box([0.02, 0.1, 0.42], groove)
        g.apply_translation([gx, -0.12, 0])
        parts.append(g)

    # Número: lata / cilindro
    num = tinted_cylinder(0.11, 0.32, [59, 130, 246, 255], 20)
    num.apply_translation([-0.48, 0.18, 0])
    parts.append(num)
    tapa = tinted_cylinder(0.12, 0.04, [37, 99, 235, 255], 20)
    tapa.apply_translation([-0.48, 0.34, 0])
    parts.append(tapa)

    # Texto: hoja ancha y baja
    txt = tinted_box([0.38, 0.06, 0.28], [167, 139, 250, 255])
    txt.apply_translation([0, 0.12, 0])
    parts.append(txt)
    line1 = tinted_box([0.28, 0.02, 0.02], [139, 92, 246, 255])
    line1.apply_translation([0, 0.12, 0.06])
    parts.append(line1)
    line2 = tinted_box([0.22, 0.02, 0.02], [139, 92, 246, 255])
    line2.apply_translation([0, 0.12, -0.02])
    parts.append(line2)

    # Booleano: pivote + cubo (interruptor)
    post = tinted_cylinder(0.04, 0.2, [100, 116, 139, 255], 10)
    post.apply_translation([0.48, 0.02, 0])
    parts.append(post)
    sw = tinted_box([0.2, 0.12, 0.14], [250, 204, 21, 255])
    sw.apply_translation([0.48, 0.2, 0])
    parts.append(sw)

    return parts


def build_operadores_expresion() -> list:
    """Esferas A y B + signo + explícito + podio resultado + puentes."""
    dark = [30, 41, 59, 255]
    slate = [148, 163, 184, 255]
    parts = []

    base = tinted_box([1.5, 0.08, 0.45], dark)
    base.apply_translation([0, -0.24, 0])
    parts.append(base)

    a = trimesh.creation.icosphere(subdivisions=2, radius=0.16)
    a.visual.face_colors = np.tile(np.array([96, 165, 250, 255], dtype=np.uint8), (len(a.faces), 1))
    a.apply_translation([-0.55, 0.1, 0])
    parts.append(a)

    for p in plus_shape_3d(0.38, [251, 191, 36, 255], 0.11):
        parts.append(p)

    b = trimesh.creation.icosphere(subdivisions=2, radius=0.16)
    b.visual.face_colors = np.tile(np.array([52, 211, 153, 255], dtype=np.uint8), (len(b.faces), 1))
    b.apply_translation([0.55, 0.1, 0])
    parts.append(b)

    # Puentes
    for x0, x1 in [(-0.39, -0.14), (0.14, 0.39)]:
        c = tinted_cylinder(0.035, abs(x1 - x0), slate, 8)
        c.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
        c.apply_translation([(x0 + x1) / 2, 0.1, 0])
        parts.append(c)

    # Resultado: podio + "=" (dos barras horizontales)
    pedestal = tinted_box([0.28, 0.1, 0.22], [34, 211, 238, 255])
    pedestal.apply_translation([0, -0.02, 0.32])
    parts.append(pedestal)
    eq1 = tinted_box([0.2, 0.04, 0.06], [165, 243, 252, 255])
    eq1.apply_translation([0, 0.02, 0.48])
    parts.append(eq1)
    eq2 = tinted_box([0.2, 0.04, 0.06], [165, 243, 252, 255])
    eq2.apply_translation([0, 0.02, 0.4])
    parts.append(eq2)

    # Flecha hacia resultado
    down = trimesh.creation.cone(radius=0.08, height=0.12, sections=10)
    down.visual.face_colors = np.tile(np.array(slate, dtype=np.uint8), (len(down.faces), 1))
    down.apply_transform(rotation_matrix(np.radians(90), [1, 0, 0]))
    down.apply_translation([0, 0.02, 0.22])
    parts.append(down)

    return parts


def build_bucles_iteracion() -> list:
    """Toride grueso (camino) + núcleo + 4 conos tangentes en sentido horario."""
    dark = [30, 41, 59, 255]
    parts = []

    base = tinted_box([1.45, 0.08, 0.48], dark)
    base.apply_translation([0, -0.3, 0])
    parts.append(base)

    # Núcleo: tres discos apilados = "repetición"
    for dy, col in [(0.06, [34, 211, 238, 255]), (0.14, [6, 182, 212, 255]), (0.22, [34, 211, 238, 255])]:
        d = tinted_cylinder(0.18, 0.06, col, 24)
        d.apply_translation([0, dy, 0])
        parts.append(d)

    R = 0.46
    try:
        tor = trimesh.creation.torus(major_radius=R, minor_radius=0.055, major_sections=56, minor_sections=14)
        tor.visual.face_colors = np.tile(np.array([71, 85, 105, 255], dtype=np.uint8), (len(tor.faces), 1))
        tor.apply_translation([0, 0.04, 0])
        parts.append(tor)
    except Exception:
        pass

    # Flechas en círculo (sentido horario visto desde arriba: +X → +Z → -X → -Z)
    angles_deg = [0, 90, 180, 270]
    for ang in angles_deg:
        rad = np.radians(ang)
        cx, cz = R * np.cos(rad), R * np.sin(rad)
        # Tangente horaria en XZ: (-sin, cos)
        tx, tz = -np.sin(rad), np.cos(rad)
        yaw = np.degrees(np.arctan2(tx, tz))
        cone = trimesh.creation.cone(radius=0.07, height=0.14, sections=12)
        cone.visual.face_colors = np.tile(np.array([52, 211, 153, 255], dtype=np.uint8), (len(cone.faces), 1))
        cone.apply_transform(rotation_matrix(np.radians(90), [1, 0, 0]))
        cone.apply_transform(rotation_matrix(np.radians(yaw), [0, 1, 0]))
        cone.apply_translation([float(cx), 0.12, float(cz)])
        parts.append(cone)

    return parts


def build_arreglos_listas() -> list:
    """Casillas en escalera (altura crece con el índice) + pestañas índice."""
    dark = [30, 41, 59, 255]
    parts = []

    base = tinted_box([1.45, 0.09, 0.42], dark)
    base.apply_translation([0, -0.2, 0])
    parts.append(base)

    xs = [-0.45, -0.15, 0.15, 0.45]
    heights = [0.1, 0.14, 0.18, 0.22]
    colors = [[59, 130, 246, 255], [96, 165, 250, 255], [125, 211, 252, 255], [34, 211, 238, 255]]

    for i, (x, h, col) in enumerate(zip(xs, heights, colors)):
        y = -0.2 + 0.045 + h / 2
        cell = tinted_box([0.2, h, 0.22], col)
        cell.apply_translation([x, y, 0])
        parts.append(cell)
        # Pestaña índice (cilindro pequeño con altura creciente = orden 0..3)
        peg = tinted_cylinder(0.04, 0.05 + i * 0.025, [51, 65, 85, 255], 8)
        peg.apply_translation([x, y + h / 2 + 0.06, 0.14])
        parts.append(peg)

    return parts


def build_funciones_modulos() -> list:
    """Embudo entrada + tubo + caja proceso + tubo + embudo salida."""
    dark = [30, 41, 59, 255]
    parts = []

    base = tinted_box([1.55, 0.09, 0.45], dark)
    base.apply_translation([0, -0.22, 0])
    parts.append(base)

    # Entrada (embudo ancho)
    inp = trimesh.creation.cone(radius=0.16, height=0.22, sections=20)
    inp.visual.face_colors = np.tile(np.array([96, 165, 250, 255], dtype=np.uint8), (len(inp.faces), 1))
    inp.apply_transform(rotation_matrix(np.radians(-90), [0, 0, 1]))
    inp.apply_translation([-0.62, 0.12, 0])
    parts.append(inp)

    tube_in = tinted_cylinder(0.06, 0.28, [71, 85, 105, 255], 12)
    tube_in.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
    tube_in.apply_translation([-0.38, 0.12, 0])
    parts.append(tube_in)

    mod = tinted_box([0.42, 0.3, 0.34], [15, 23, 42, 255])
    mod.apply_translation([0, 0.14, 0])
    parts.append(mod)
    lid = tinted_box([0.44, 0.05, 0.36], [30, 41, 59, 255])
    lid.apply_translation([0, 0.3, 0])
    parts.append(lid)

    tube_out = tinted_cylinder(0.06, 0.28, [71, 85, 105, 255], 12)
    tube_out.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
    tube_out.apply_translation([0.38, 0.12, 0])
    parts.append(tube_out)

    out = trimesh.creation.cone(radius=0.16, height=0.22, sections=20)
    out.visual.face_colors = np.tile(np.array([52, 211, 153, 255], dtype=np.uint8), (len(out.faces), 1))
    out.apply_transform(rotation_matrix(np.radians(90), [0, 0, 1]))
    out.apply_translation([0.62, 0.12, 0])
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
    print("Listo: 6 modelos explicativos en assets/.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
