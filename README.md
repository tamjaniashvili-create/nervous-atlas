# ნერვული სისტემის ატლასი · Nervous System Atlas

Interactive 3D atlas of the human nervous system for medical education, with two modes:

- **ნორმა (Normal):** 10 anatomical views: whole body, cortex (gyri), lobes, deep nuclei and ventricles, cerebral arteries, cranial nerves, spinal cord, brachial plexus, lower limb, and an animated corticospinal pathway. Click any structure to see its Georgian name, function, and FMA ID.
- **ნეირონი (Cellular level):** 8 animated steps: neuron and glia, resting potential, action potential with a live Vm(t) trace, saltatory conduction, Ca²⁺ entry, SNARE exocytosis, receptor binding and EPSP, and the neuromuscular junction with sarcomere contraction. Each step lists its drug targets and clinical links. The geometry here is schematic and procedural (not BodyParts3D).
- **პათოლოგია (Pathology):** 17 nosologies, including myasthenia gravis and Lambert–Eaton syndrome, which are animated at the synapse level with antibodies, receptor loss, and an EPP decrement/increment chart. Each one has an ICD-10 code, a description, a 4-step pathogenesis animated on the model, the clinical picture, and references.

`/schematic/` holds the earlier procedural version, which has nerve–muscle signal animation and a quiz.

## Data and attribution

3D geometry: **BodyParts3D**, © The Database Center for Life Science (DBCLS), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source: <https://dbarchive.biosciencedbc.jp/en/bodyparts3d/>.

The meshes were adapted as follows:
- simplified with meshoptimizer and quantised to 16-bit;
- merged from the BodyParts3D 4.0 IS-A set (via the [human-atlas](https://github.com/ashemag/human-atlas) packing) and the part-of OBJ set (via [body_parts_3d_api](https://github.com/olivercase/body_parts_3d_api));
- upper-limb nerves exist only on the left in the source, so the right side is a mirrored copy;
- lower-limb nerves are not in BodyParts3D, so they are drawn as **schematic** tubes placed on the real skeleton.

## Files

| File | Contents |
|---|---|
| `index.html` | the app (Three.js r128) |
| `pack.json` / `pack.wasm` | mesh manifest and raw mesh bytes (`.wasm` extension only so hosts serve it as binary) |
| `src/` | page head/CSS, engine, Georgian names (`names.js`), pathology content (`nosology.js`) |
| `tools/` | mesh extraction and build scripts |
| `schematic/` | previous procedural version |

## Disclaimer

Educational material only; not clinical guidance. Pathology summaries are drawn from review sources (StatPearls, guidelines) and are pending expert review.
