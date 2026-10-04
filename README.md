# restaurants-suite

Frontend de la plataforma de pedidos y domicilios para restaurantes: carta web,
carrito, checkout, panel, cocina y domiciliario.

- Reglas del proyecto: [CLAUDE.md](CLAUDE.md)
- Documentación del producto: [docs/README.md](docs/README.md)
- API: `../restaurants-api`

## Arrancar

```sh
pnpm install
cp .env.example .env
pnpm dev
```

La carta necesita la API corriendo con el restaurante de demostración (ver
`../restaurants-api/README.md`: `pnpm db:seed` y `pnpm start:dev`). Luego:
http://localhost:5173/la-parrilla-de-tono

El panel del restaurante está en http://localhost:5173/entrar. Cuentas de la
demostración (contraseña `demo-parrilla-2026`): `caja@laparrilla.test`,
`cocina@laparrilla.test`, `dueno@laparrilla.test`.

Requiere Node ≥ 20.19 y pnpm 10.

## Gates

```sh
pnpm check && pnpm lint && pnpm format:check && pnpm test && pnpm build
```
