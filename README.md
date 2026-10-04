# restaurants-suite

Frontend de la plataforma de pedidos y domicilios para restaurantes: carta web,
carrito, checkout, panel, cocina y domiciliario.

- Reglas del proyecto: [CLAUDE.md](CLAUDE.md)
- Documentación del producto: [docs/README.md](docs/README.md)
- API: `../restaurants-api`

## Arrancar

```sh
pnpm install
pnpm dev
```

Requiere Node ≥ 20.19 y pnpm 10.

## Gates

```sh
pnpm check && pnpm lint && pnpm format:check && pnpm test && pnpm build
```
