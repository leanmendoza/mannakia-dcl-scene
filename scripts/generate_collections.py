#!/usr/bin/env python3
"""
Genera archivos filtrados de wearables y emotes por colección.
Requiere que primero se ejecute fetch_catalog.py

Genera:
  - wearables_by_collection.json: Map<CollectionName, Wearable[]>
  - emotes_by_collection.json: Map<CollectionName, Emote[]>
"""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
CATALOG_FILE = os.path.join(SCRIPT_DIR, "decentraland_catalog.json")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "assets", "json")


def generate_wearables_by_collection(wearables):
    """Genera mapa de wearables por colección."""
    collection_map = {}

    for wearable in wearables:
        collection_name = wearable.get('_collection_name', 'Unknown')
        w_data = wearable.get('data', {})

        # Collect all "hides" related fields
        hides_set = set()
        hides_set.update(w_data.get('hides', []))
        hides_set.update(w_data.get('replaces', []))
        hides_set.update(w_data.get('removesDefaultHiding', []))

        for rep in w_data.get('representations', []):
            hides_set.update(rep.get('overrideHides', []))
            hides_set.update(rep.get('overrideReplaces', []))

        simplified = {
            'id': wearable.get('id', ''),
            'category': w_data.get('category', ''),
            'name': wearable.get('name', ''),
            'hides': sorted(list(hides_set)) if hides_set else []
        }

        if collection_name not in collection_map:
            collection_map[collection_name] = []
        collection_map[collection_name].append(simplified)

    return collection_map


def generate_emotes_by_collection(emotes):
    """Genera mapa de emotes por colección."""
    collection_map = {}

    for emote in emotes:
        collection_name = emote.get('_collection_name', 'Unknown')
        emote_data = emote.get('emoteDataADR74', {})

        simplified = {
            'id': emote.get('id', ''),
            'category': emote_data.get('category', ''),
            'name': emote.get('name', ''),
            'loop': emote_data.get('loop', False)
        }

        if collection_name not in collection_map:
            collection_map[collection_name] = []
        collection_map[collection_name].append(simplified)

    return collection_map


def main():
    print("=" * 60)
    print("Decentraland Collections Generator")
    print("=" * 60)

    # Check if catalog exists
    if not os.path.exists(CATALOG_FILE):
        print(f"Error: No se encontró {CATALOG_FILE}")
        print("Ejecuta primero: python3 fetch_catalog.py")
        sys.exit(1)

    # Load catalog
    print(f"\nCargando {CATALOG_FILE}...")
    with open(CATALOG_FILE) as f:
        data = json.load(f)

    print(f"  Wearables: {len(data.get('wearables', []))}")
    print(f"  Emotes: {len(data.get('emotes', []))}")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate wearables by collection
    print(f"\nGenerando wearables_by_collection.json en {OUTPUT_DIR}...")
    wearables_map = generate_wearables_by_collection(data.get('wearables', []))
    wearables_file = os.path.join(OUTPUT_DIR, "wearables_by_collection.json")
    with open(wearables_file, 'w', encoding='utf-8') as f:
        json.dump(wearables_map, f, indent=2, ensure_ascii=False)

    wearables_size = os.path.getsize(wearables_file) / 1024
    total_wearables = sum(len(w) for w in wearables_map.values())
    print(f"  Colecciones: {len(wearables_map)}")
    print(f"  Wearables: {total_wearables}")
    print(f"  Tamaño: {wearables_size:.1f} KB")

    # Generate emotes by collection
    print(f"\nGenerando emotes_by_collection.json en {OUTPUT_DIR}...")
    emotes_map = generate_emotes_by_collection(data.get('emotes', []))
    emotes_file = os.path.join(OUTPUT_DIR, "emotes_by_collection.json")
    with open(emotes_file, 'w', encoding='utf-8') as f:
        json.dump(emotes_map, f, indent=2, ensure_ascii=False)

    emotes_size = os.path.getsize(emotes_file) / 1024
    total_emotes = sum(len(e) for e in emotes_map.values())
    print(f"  Colecciones: {len(emotes_map)}")
    print(f"  Emotes: {total_emotes}")
    print(f"  Tamaño: {emotes_size:.1f} KB")

    # Summary
    print("\n" + "=" * 60)
    print("Archivos generados:")
    print(f"  {wearables_file}")
    print(f"  {emotes_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()
