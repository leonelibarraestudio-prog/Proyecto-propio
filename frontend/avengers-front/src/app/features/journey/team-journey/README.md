# R7 — Camino del Equipo

## Descripción

La funcionalidad R7 permite recorrer el Journey actual del Player Team y consultar el detalle de sus encuentros.

La pantalla presenta una línea temporal con los encuentros del equipo, sus rivales, etapas, estados, resultados y daño causado o recibido.

Al seleccionar un encuentro completado, se muestra su detalle, incluyendo las rondas, iniciativa, resultados, héroes activos y eventos publicados por Avengers Game API.

R7 es una funcionalidad de consulta. No modifica datos ni ejecuta acciones de combate.

## Arquitectura

La implementación respeta la arquitectura establecida por la cátedra:

```text
Angular Frontend
    ↓
TeamJourneyComponent
    ↓
TeamJourneyService (Angular)
    ↓
BaseApiService / ApiService
    ↓ HTTP
TeamJourneyController (NestJS)
    ↓
TeamJourneyService (NestJS)
    ↓
Avengers Game API
```

El frontend nunca se comunica directamente con Game API.

El backend obtiene `TEAM_ID` y `APP_LANG` mediante el contexto de aplicación y utiliza esos valores para consultar los recursos correspondientes.

## Contrato entre Frontend y Backend

R7 utiliza dos endpoints HTTP de lectura.

Ambos emplean el método `GET` y no requieren un cuerpo de solicitud.

### 1. Consultar el Journey actual

**Endpoint:**

`GET /gameCore/journey/team`

**Solicitud desde Angular:**

```typescript
this.getData<TeamJourneyModel>('/journey/team');
```

**Modelo de respuesta:** `TeamJourneyModel`

| Campo | Tipo | Descripción |
|---|---|---|
| `teamId` | `string` | Identificador del Player Team |
| `attemptId` | `string \| null` | Identificador del Journey actual |
| `status` | `string \| null` | Estado actual del Journey |
| `stageCount` | `number \| null` | Cantidad de etapas publicadas |
| `encounterCount` | `number \| null` | Cantidad de encuentros publicados |
| `language` | `'es' \| 'en'` | Idioma de la respuesta |
| `teams` | `JourneyRoster[]` | Equipos y héroes participantes |
| `encounters` | `JourneyEncounterItem[]` | Encuentros completados del Player Team |
| `final` | `object \| null` | Rival, estado y resultado de la Final |

La interfaz `JourneyRoster` contiene:

- `teamId`: identificador del equipo.
- `name`: nombre del equipo.
- `leaderId`: identificador de su líder.
- `heroes`: colección de identificadores y nombres de héroes.

La interfaz `JourneyEncounterItem` contiene:

- `encounterId`: identificador del encuentro.
- `stageCode`: etapa del torneo.
- `opponentTeamId`: identificador del equipo rival.
- `status`: estado del encuentro.
- `resultCode`: resultado publicado.
- `damageDealt`: daño causado.
- `damageReceived`: daño recibido.

Cuando no existe un Journey actual, el modelo permite representar esa situación mediante campos nulos y colecciones vacías.

### 2. Consultar el detalle de un encuentro

**Endpoint:**

`GET /gameCore/journey/team/encounters/:encounterId`

**Solicitud desde Angular:**

```typescript
const path = `/journey/team/encounters/${encodeURIComponent(encounterId)}`;

this.getData<TeamJourneyDetailModel>(path);
```

**Parámetro de ruta:**

`encounterId`: identificador del encuentro seleccionado.

**Modelo de respuesta:** `TeamJourneyDetailModel`

| Campo | Tipo | Descripción |
|---|---|---|
| `encounterId` | `string` | Identificador del encuentro |
| `rounds` | `JourneyRound[]` | Rondas publicadas |
| `extraRound` | `JourneyRound \| null` | Ronda adicional, cuando existe |

Cada `JourneyRound` contiene:

- `number`: número de ronda.
- `roundType`: tipo de ronda.
- `initiativeTeamId`: equipo con iniciativa.
- `winnerTeamId`: equipo ganador de la ronda, si existe.
- `damageByTeam`: daño publicado por equipo.
- `activeHeroIdsByTeam`: héroes activos por equipo.
- `events`: eventos ocurridos durante la ronda.

Cada evento incluye su secuencia, códigos, participantes, valores disponibles y narrativa publicada.

Angular ordena los eventos por `sequence` y las líneas narrativas por `lineSequence` para facilitar su presentación.

No calcula daño, resultados, ganadores ni otras reglas del juego.

## Formato general de las respuestas HTTP

Los endpoints utilizan la estructura compartida `ResponseObject<T>`:

```typescript
interface ResponseObject<T> {
  serverTime: string;
  success: boolean;
  responseMessage: {
    messageCode: string;
    message: string;
  };
  data: T | null;
}
```

La propiedad `data` contiene el modelo correspondiente a cada endpoint.

La infraestructura compartida de Angular procesa esta respuesta mediante `BaseApiService` y la función `responseData()`.

Cuando `data` contiene información válida, se devuelve el modelo tipado.

Cuando `data` es `null`, se genera un `ApiError`.

Los errores HTTP se normalizan mediante `toApiError()`.

## Estados de la pantalla

R7 contempla los siguientes estados:

- **Loading:** mientras se consulta la información.
- **Error:** cuando falla una consulta.
- **Sin Journey:** cuando todavía no existe un recorrido disponible.
- **Sin encuentros:** cuando no hay encuentros publicados para el Player Team.
- **Detalle pendiente o no disponible:** cuando el encuentro no tiene información para mostrar.
- **Datos disponibles:** cuando el Journey y sus encuentros pueden consultarse.

La selección de un encuentro actualiza su detalle sin necesidad de abandonar la pantalla.

## Modelos del Frontend

Ubicación:

`frontend/avengers-front/src/app/features/journey/team-journey/model/`

Archivo principal:

`team-journey-api.interface.ts`

Interfaces utilizadas:

- `TeamJourneyModel`
- `TeamJourneyDetailModel`
- `JourneyRoster`
- `JourneyEncounterItem`
- `JourneyRound`
- `JourneyEvent`

## Modelos del Backend

Ubicación:

`backend/avengers-back/src/journey/team-journey/model/`

Archivos:

- `team-journey.model.ts`
- `team-journey-game-api.model.ts`

El backend utiliza modelos tipados para representar los datos recibidos desde Game API y las respuestas que entrega a Angular.

El Controller documenta los endpoints mediante los decoradores de Swagger:

- `@ApiTags`
- `@ApiOperation`
- `@ApiParam`

## Separación de responsabilidades

### Angular

- Presenta la línea temporal del Journey.
- Permite seleccionar encuentros y rondas.
- Administra los estados de pantalla.
- Ordena los eventos para su visualización.
- Muestra únicamente la información recibida.

### NestJS

- Recibe las solicitudes del frontend.
- Consulta los recursos públicos de Game API.
- Combina información de Journey, Teams, Heroes y Encounters.
- Devuelve respuestas adaptadas a las necesidades de R7.
- Mantiene el contrato de comunicación con Angular.

### Avengers Game API

Es la autoridad sobre:

- Reglas de combate.
- Estados del Journey.
- Resultados.
- Daño.
- Persistencia.
- Eventos y narrativa.

R7 no incorpora persistencia propia ni modifica las reglas del juego.

## Consideraciones finales

La funcionalidad utiliza exclusivamente recursos del Journey actual mediante las rutas `current` de Game API.

El identificador `attemptId` puede formar parte de los datos recibidos, pero no se utiliza para construir rutas históricas.

El detalle de los encuentros pertenece a R7 y no constituye una funcionalidad independiente.

La implementación mantiene la separación entre Frontend, Backend y Game API establecida por la cátedra.