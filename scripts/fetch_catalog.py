#!/usr/bin/env python3
"""
Descarga el catálogo completo de wearables y emotes de Decentraland.
Guarda el resultado en decentraland_catalog.json
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import ssl
import time
import sys
import os
from datetime import datetime

BASE_URL = "https://peer.decentraland.org/lambdas"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

ssl_context = ssl.create_default_context()


def fetch_json(url, params=None, max_retries=3, delay=2):
    if params:
        query_string = urllib.parse.urlencode(params, doseq=True)
        url = f"{url}?{query_string}"

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "DecentralandCatalogDumper/1.0"}
            )
            with urllib.request.urlopen(req, timeout=120, context=ssl_context) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            print(f"    Intento {attempt + 1}/{max_retries} fallido: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))
            else:
                return None
    return None


def fetch_all_collections():
    print("Obteniendo lista de colecciones...")
    url = f"{BASE_URL}/collections"
    data = fetch_json(url)
    if data and "collections" in data:
        return data["collections"]
    return data if isinstance(data, list) else []


def fetch_wearables_by_collection(collection_id):
    url = f"{BASE_URL}/collections/wearables"
    params = {"collectionId": collection_id}
    data = fetch_json(url, params)
    if data and "wearables" in data:
        return data["wearables"]
    return []


def fetch_emotes_by_collection(collection_id):
    url = f"{BASE_URL}/collections/emotes"
    params = {"collectionId": collection_id}
    data = fetch_json(url, params)
    if data and "emotes" in data:
        return data["emotes"]
    return []


def fetch_all_wearables(collections):
    all_wearables = []
    wearable_collections = [c for c in collections if "emote" not in c.get("id", "").lower()]

    print(f"\nObteniendo wearables de {len(wearable_collections)} colecciones...")

    for i, collection in enumerate(wearable_collections):
        collection_id = collection.get("id", "")
        collection_name = collection.get("name", collection_id)

        print(f"  [{i+1}/{len(wearable_collections)}] {collection_name}...", end=" ", flush=True)

        try:
            wearables = fetch_wearables_by_collection(collection_id)
            if wearables:
                for w in wearables:
                    w["_collection_name"] = collection_name
                all_wearables.extend(wearables)
                print(f"{len(wearables)} items")
            else:
                print("0 items")
        except Exception as e:
            print(f"Error: {e}")

        time.sleep(0.3)

    return all_wearables


def fetch_all_emotes(collections):
    all_emotes = []

    print(f"\nObteniendo emotes de {len(collections)} colecciones...")

    for i, collection in enumerate(collections):
        collection_id = collection.get("id", "")
        collection_name = collection.get("name", collection_id)

        print(f"  [{i+1}/{len(collections)}] {collection_name}...", end=" ", flush=True)

        try:
            emotes = fetch_emotes_by_collection(collection_id)
            if emotes:
                for e in emotes:
                    e["_collection_name"] = collection_name
                all_emotes.extend(emotes)
                print(f"{len(emotes)} items")
            else:
                print("0 items")
        except Exception as e:
            print(f"Error: {e}")

        time.sleep(0.3)

    return all_emotes


def main():
    print("=" * 60)
    print("Decentraland Catalog Fetcher")
    print("=" * 60)
    print(f"Fecha: {datetime.now().isoformat()}")
    print(f"API Base: {BASE_URL}")
    print()

    result = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "api_base": BASE_URL
        },
        "collections": [],
        "wearables": [],
        "emotes": []
    }

    # Fetch collections
    collections = fetch_all_collections()
    result["collections"] = collections
    print(f"Total colecciones: {len(collections)}")

    if not collections:
        print("Error: No se pudieron obtener las colecciones")
        return

    # Fetch all wearables
    wearables = fetch_all_wearables(collections)
    result["wearables"] = wearables

    # Fetch all emotes
    emotes = fetch_all_emotes(collections)
    result["emotes"] = emotes

    # Save to file
    output_file = os.path.join(OUTPUT_DIR, "decentraland_catalog.json")
    print(f"\nGuardando en {output_file}...")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    file_size = os.path.getsize(output_file) / (1024 * 1024)

    print("\n" + "=" * 60)
    print("Resumen:")
    print(f"  Colecciones: {len(result['collections'])}")
    print(f"  Wearables: {len(result['wearables'])}")
    print(f"  Emotes: {len(result['emotes'])}")
    print(f"\nArchivo guardado: {output_file} ({file_size:.2f} MB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
