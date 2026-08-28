# Astro Survey MOC Core

`astro-survey-moc-core` is the shared, deterministic scientific Core for the
Astro Survey Atlas organization. It converts reviewed local inputs into
canonical ICRS/NESTED HEALPix cells, IVOA FITS MOCs, fixed-order projections,
provenance and Resource Package v3 archives.

The Core is deliberately offline after a source snapshot has been locked.
Assets uses it to build public coverage releases, Workspace uses the same
wheel for local and user MOCs, and Warehouse keeps its high-throughput Java
scanner compatible through the fixtures in `fixtures/conformance`.

## Install

```bash
python3 -m pip install astro_survey_moc_core-1.0.0-py3-none-any.whl
astro-survey-moc-core --version
```

Scientific dependencies are pinned in `requirements.lock`. Build a wheel with:

```bash
SOURCE_DATE_EPOCH=1787184000 python3 -m pip wheel --no-deps --no-build-isolation . -w wheelhouse
```

## CLI lifecycle

`refresh` is the only network-enabled command. It stores a source snapshot and
lock; `build`, `rebuild`, `merge`, `project` and `package` operate on local,
already-reviewed inputs. A recipe must declare ICRS, NESTED, real available
orders, precision and source hashes.

```bash
astro-survey-moc-core refresh --spec recipe.json --snapshot-dir snapshots --lock recipe.lock.json
SOURCE_DATE_EPOCH=1787184000 astro-survey-moc-core rebuild --spec recipe.lock.json --base-dir snapshots --output build
astro-survey-moc-core project --moc build/layer.moc.fits --order 8 --output query-order8.json
```

See [the Core contract](docs/moc-core-contract.md) and the JSON schemas under
`contracts/` for the complete scientific and package boundary.

## Compatibility

The package name, import name (`astro_survey_moc_core`), CLI name and Core
contract remain `1.0.0` for the first organization checkout. Consumers must
record the exact Core commit and wheel SHA-256; a preview order must never be
promoted to a finer measurement.
