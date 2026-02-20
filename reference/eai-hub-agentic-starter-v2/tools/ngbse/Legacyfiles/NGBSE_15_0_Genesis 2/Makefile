# NGBSE 15.0 Genesis
.PHONY: install run test docker build

install:
	python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pip install .

run:
	ngbse --config ngbse.config.yml --seeds seeds.jsonl --out out

test:
	python -m pytest -q

docker:
	docker build -t ngbse:15 .

compose-up:
	docker compose up --build

compose-down:
	docker compose down
