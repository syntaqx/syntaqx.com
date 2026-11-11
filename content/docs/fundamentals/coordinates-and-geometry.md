+++
title = "Coordinates & Geometry"
description = "Storing and exchanging points and shapes: WGS 84, longitude-latitude order, GeoJSON, PostGIS geography versus geometry, and formats to use instead of GeoJSON."
category = "Fundamentals"
order = 107
tags = ["geojson", "postgis", "gis", "coordinates", "standards", "databases"]
+++

Location data starts as a pair of numbers and grows into shapes: a pin for a customer's door, a line for a delivery route, a polygon for a service territory or a geofence. The numbers are easy. What goes wrong is everything around them: which earth model they're measured against, which of the two comes first, how many digits mean anything, and which format carries them between systems. A swapped pair doesn't throw an error; it puts the customer in the ocean.

## What I Choose

- **One coordinate system: WGS 84 longitude and latitude in decimal degrees** (EPSG:4326), the system GeoJSON requires and PostGIS assumes by default. Anything projected for a map or a local calculation is derived from it, never stored instead of it.
- **Points in an API as named fields:** `{"latitude": -33.8568, "longitude": 151.2153}`. Names make the order impossible to get wrong.
- **Shapes in an API as GeoJSON,** served as `application/geo+json`. It's the one geometry format every language, database and map library reads.
- **Storage in PostGIS `geography`,** so distances and areas come back in meters on the real earth. I switch to `geometry` only for the cases below.
- **Six decimal places** on the way out, about 10 centimeters, and the measurement's accuracy stored beside it.

The sections below cover each of these, then the other formats and when they're the better choice.

## Coordinates: Datum, Order and Precision

A coordinate is only meaningful against a datum, the model of the earth it's measured on. [GeoJSON](https://datatracker.ietf.org/doc/html/rfc7946#section-4) fixes its datum as WGS 84, and PostGIS's `geography` type [defaults to SRID 4326](https://postgis.net/docs/using_postgis_dbmanagement.html), the same system. Data from surveys, national mapping agencies or older GIS exports can arrive in a local projection instead; convert it to WGS 84 at import and record what it came in as.

### Which Number Comes First

There is no single convention, and that's the most common bug in location code:

| Where | Order |
| ----- | ----- |
| [GeoJSON](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.1) | Longitude, latitude (then optional altitude) |
| WKT, WKB and PostGIS [`ST_MakePoint`](https://postgis.net/docs/ST_MakePoint.html) | X, Y: longitude, latitude |
| [TopoJSON](https://github.com/topojson/topojson-specification) | Longitude, latitude |
| KML [`<coordinates>`](https://developers.google.com/kml/documentation/kmlreference) | Longitude, latitude (then optional altitude), comma-separated |
| Google Maps [`LatLng`](https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng) | Latitude, longitude |
| Leaflet [`LatLng`](https://leafletjs.com/reference.html#latlng) and its `[lat, lng]` arrays | Latitude, longitude |
| Google's [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) examples | Latitude, longitude |

Map libraries say "latitude, longitude" because that's how people read a position aloud; data formats say "longitude, latitude" because longitude is the X axis. Leaflet ships a `coordsToLatLng` helper precisely to swap GeoJSON's pairs into its own.

- **Name the fields wherever you can.** `latitude` and `longitude` in an API, `lat`/`lng` properties in client code, never a bare two-element array outside a format that defines its order.
- **Swap in one place.** Convert at the boundary with the map library, in one function with a test, not wherever a component happens to need a point.
- **Test with a point that can't survive a swap.** Latitude only runs from -90 to 90. A fixture like Sydney (latitude -33.86, longitude 151.21) becomes an invalid latitude of 151.21 when reversed, so validation catches the bug; a fixture near the equator and the prime meridian swaps silently.

### Precision Isn't Accuracy

RFC 7946 notes that [six decimal places](https://datatracker.ietf.org/doc/html/rfc7946#section-11.2) amount to about 10 centimeters, and that the number of digits [says nothing](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.10) about how uncertain the position is. A phone fix good to 50 meters still prints 15 digits. Round output to six places, and store the accuracy the device reported or the geocoder's precision in its own column ([A Position Is a Measurement](/docs/building-blocks/location-tracking#a-position-is-a-measurement), [Geocode and Precision](/docs/fundamentals/addresses#geocode-and-precision)).

## GeoJSON

[RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946) (August 2016) defines GeoJSON: seven geometry types (`Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`, `GeometryCollection`), plus a `Feature` that pairs a geometry with `properties`, and a `FeatureCollection` of features.

```json
{
  "type": "Feature",
  "id": "0193d1a2-7c4e-7b10-9f2a-3e4d5c6b7a81",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [151.2140, -33.8580],
      [151.2165, -33.8580],
      [151.2165, -33.8555],
      [151.2140, -33.8555],
      [151.2140, -33.8580]
    ]]
  },
  "properties": { "name": "Harbour depot service area" }
}
```

The rules that trip people up:

- **Longitude first, and WGS 84 only.** The 2008 community format allowed a `crs` member naming another coordinate system; RFC 7946 [dropped it](https://datatracker.ietf.org/doc/html/rfc7946#appendix-B.1). A GeoJSON file in another projection isn't valid GeoJSON.
- **Rings close.** A polygon ring has [four or more positions](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6), and the first and last must be identical: the square above has five.
- **Rings wind by the right-hand rule.** The outer ring runs counterclockwise and holes run clockwise. Parsers [should not reject](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6) the wrong winding, for backwards compatibility, so data from the wild arrives both ways. Normalize it on import; PostGIS's `ST_ForcePolygonCCW` does it.
- **Cut at the antimeridian.** A shape that crosses longitude 180, such as a territory spanning Fiji or the Aleutians, [should be split](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.9) into two parts, or a naive renderer draws it the long way around the world.
- **`bbox` is west, south, east, north.** An optional [`bbox`](https://datatracker.ietf.org/doc/html/rfc7946#section-5) member gives the extent, ordered [west, south, east, north](https://datatracker.ietf.org/doc/html/rfc7946#appendix-B.1), which for a box crossing the antimeridian means west is greater than east.
- **Extend with properties, not types.** Extra members are [allowed](https://datatracker.ietf.org/doc/html/rfc7946#section-6.1), but implementations [must not](https://datatracker.ietf.org/doc/html/rfc7946#section-7) add geometry types. Your own data goes in `properties`.

Parsing it is a library call. Both libraries keep GeoJSON's order, so the first coordinate is longitude:

```go tab="Go"
fc, err := geojson.UnmarshalFeatureCollection(body) // github.com/paulmach/orb/geojson
if err != nil {
	return err
}
for _, f := range fc.Features {
	if p, ok := f.Geometry.(orb.Point); ok {
		lon, lat := p.Lon(), p.Lat()
		// ...
	}
}
```

```rust tab="Rust"
use geojson::{GeoJson, GeometryValue}; // geojson crate

let geojson: GeoJson = body.parse()?;
if let GeoJson::FeatureCollection(fc) = geojson {
    for feature in fc.features {
        if let Some(geometry) = feature.geometry {
            if let GeometryValue::Point { coordinates } = geometry.value {
                let (lon, lat) = (coordinates[0], coordinates[1]);
                // ...
            }
        }
    }
}
```

## Storing Geometry: PostGIS

PostgreSQL stores spatial data through [PostGIS](https://postgis.net/docs/using_postgis_dbmanagement.html), which has two types for it:

- **`geography`** is [based on a spherical model](https://postgis.net/docs/using_postgis_dbmanagement.html) of the earth. Measurements come back in meters, and distance and area are calculated on the spheroid by default. It's my default, because "within 500 meters" and "how many square kilometers" just work anywhere on the planet.
- **`geometry`** works on a flat plane in whatever units its coordinate system uses, which for SRID 4326 means degrees: a "distance" of 0.01 is a different number of meters in Oslo than in Singapore. It has [more functions and is faster](https://postgis.net/docs/using_postgis_dbmanagement.html), so I use it for heavy geometric processing (unions, buffers, simplification) and for data that lives in a local projected system, and cast between the two where needed.

```sql
CREATE TABLE service_areas (
  id    UUID PRIMARY KEY DEFAULT uuidv7(),
  name  TEXT NOT NULL,
  area  GEOGRAPHY(MULTIPOLYGON, 4326) NOT NULL
);

-- Spatial indexes are GiST indexes over bounding boxes.
CREATE INDEX service_areas_area_idx ON service_areas USING GIST (area);

-- From GeoJSON: ST_GeomFromGeoJSON takes the geometry member, not the whole Feature.
INSERT INTO service_areas (name, area)
VALUES ($1, ST_Multi(ST_ForcePolygonCCW(ST_GeomFromGeoJSON($2)))::geography);

-- Points: ST_MakePoint takes longitude first.
SELECT id, name
  FROM service_areas
 WHERE ST_DWithin(area, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 500); -- meters

-- To GeoJSON, rounded to six decimal places (the default is nine).
SELECT ST_AsGeoJSON(area::geometry, 6) FROM service_areas WHERE id = $1;
```

- **[`ST_GeomFromGeoJSON`](https://postgis.net/docs/ST_GeomFromGeoJSON.html)** reads only a geometry fragment and throws on a whole document, so pass it the `geometry` member of each feature. Since PostGIS 3.0 it assumes SRID 4326 when none is given.
- **[`ST_AsGeoJSON`](https://postgis.net/docs/ST_AsGeoJSON.html)** writes nine decimal places unless told otherwise. Its documentation warns that reducing them can make output geometry invalid, which is worth a check for small, detailed polygons.
- **[`ST_DWithin`](https://postgis.net/docs/ST_DWithin.html)** on `geography` measures in meters and uses the spatial index. Prefer it to computing `ST_Distance` for every row and filtering.
- **The index holds [bounding boxes](https://postgis.net/workshops/postgis-intro/indexing.html),** so a spatial query first narrows to boxes that overlap and then tests the exact shapes. Run `ANALYZE` after a bulk load so the planner knows the index is worth using.

Point-in-polygon lookups (which territory, tax district or service area holds this address) are covered in [Point in Polygon with PostGIS](/books/field-operations/territories-and-capacity#point-in-polygon-with-postgis), including why `ST_Covers` beats `ST_Contains` on boundaries.

## Other Formats

GeoJSON is my default for exchange because everything reads it, not because it's the best at any one job. It's verbose, it repeats every shared border, and a large file has to be parsed whole. These are the formats I reach for instead:

| Format | Encoding | Defined by | Use it for |
| ------ | -------- | ---------- | ---------- |
| WKT and WKB | Text and binary | [OGC Simple Features](https://www.ogc.org/standards/sfa/) 1.2.1 (ISO 19125) | Moving geometry in and out of databases |
| TopoJSON | JSON | [TopoJSON specification](https://github.com/topojson/topojson-specification) | Maps of regions that share borders |
| Encoded polyline | ASCII string | [Google](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) | Routes and tracks in URLs and mobile payloads |
| FlatGeobuf | Binary (FlatBuffers) | [FlatGeobuf](https://flatgeobuf.org/) | Large datasets streamed or served as static files |
| GeoParquet | Columnar (Parquet) | [GeoParquet](https://geoparquet.org/), an incubating OGC standard | Analytics and warehouses |
| Vector tiles | Binary (Protocol Buffers) | [Mapbox Vector Tile](https://github.com/mapbox/vector-tile-spec) 2.1 | Rendering maps, not exchanging data |
| GeoPackage | SQLite file | [OGC](https://www.geopackage.org/) 1.4.0 | Handing many layers to GIS tools |
| KML | XML | [OGC](https://www.ogc.org/standards/kml/) 2.3 | Google Earth and visualization tools |
| GPX | XML | [TopoGrafix](https://www.topografix.com/gpx.asp) 1.1 | Waypoints, routes and tracks from GPS devices |

- **WKT and WKB** are what databases speak. WKT is text (`POINT(151.2153 -33.8568)`, longitude first), and WKB is its [full-precision binary form](https://postgis.net/docs/using_postgis_dbmanagement.html). PostGIS's extended versions, EWKT and EWKB, add the SRID (`SRID=4326;POINT(...)`) and 3D or 4D coordinates, but PostGIS warns not to rely on other systems reading them. Use these between a service and its database or a GIS tool, and GeoJSON across an API.
- **TopoJSON** stores each shared border once, as an arc that neighboring shapes reference, and [quantizes](https://github.com/topojson/topojson-specification) positions to integers. Counties, postal areas and sales territories that tile a region shrink a lot. It's a client-side rendering format; convert it back to GeoJSON before doing anything else with it.
- **Encoded polylines** compress a line into one string by storing each point as an offset from the last, at [five decimal places](https://developers.google.com/maps/documentation/utilities/polylinealgorithm), about a meter. Google's routing APIs return them, and they fit a long route in a URL. Escape backslashes when the string goes into source code.
- **FlatGeobuf** is binary, with an optional [packed Hilbert R-tree](https://flatgeobuf.org/) index, and a client can fetch just the features in a bounding box from a static file using HTTP range requests. It's built for writing once and reading fast; it doesn't support random writes.
- **GeoParquet** puts geometry into Parquet's columnar format for warehouses and data science tools ([Warehouses & Lakes](/docs/data/warehouses-and-lakes)). Version 2.0.0 is agreed by the community and pending OGC approval, and its own maintainers say it's not a good choice for write-heavy work.
- **Vector tiles** cut a map into tiles of Protocol Buffers with integer coordinates relative to each tile, in Web Mercator. They're how a map client draws millions of features quickly, and they're an output: generate them from the source data, never treat them as the source.
- **GeoPackage** is an OGC-standard SQLite file that holds many vector and raster layers with their metadata, which makes it the file to hand a GIS analyst. Its own FAQ calls it potentially overkill for simple exchange.
- **KML and GPX** are XML formats I accept on import. KML is for visualization (Google Earth, placemarks with styling), and GPX carries waypoints, routes and tracks from GPS devices and fitness apps.
- **Shapefiles** still arrive from government and GIS sources. Esri's [technical description](https://www.esri.com/content/dam/esrisites/sitecore-archive/Files/Pdfs/library/whitepapers/pdfs/shapefile.pdf) (July 1998) defines one as several files sharing a name: the geometry in `.shp`, an index in `.shx`, and the attributes in a dBASE `.dbf` table with one record per shape. Every non-null shape in a file must be the same type, so points and polygons need separate shapefiles, and a missing `.dbf` loses every attribute. Accept them on import as a zip of all the parts, convert them to GeoJSON or PostGIS immediately, and don't produce them.

### Cells Instead of Shapes

Sometimes the question isn't "is this point inside that polygon" but "which area is this point in", for counting, heatmaps or grouping nearby things. Grid systems answer that with an ID per cell instead of a shape:

- **[H3](https://h3geo.org/docs/)** divides the world into hexagons at [16 resolutions](https://h3geo.org/docs/core-library/restable) (0 to 15). A child cell is only approximately inside its parent's shape.
- **[S2](https://s2geometry.io/)** projects a cube onto the sphere and divides each face into quadrants down to [level 30](https://s2geometry.io/devguide/s2cell_hierarchy), each cell identified by a 64-bit ID along a Hilbert curve, so nearby cells usually have nearby IDs.
- **Geohash** is the older, simpler scheme: a string in which each extra character narrows a rectangle. PostGIS's [`ST_GeoHash`](https://postgis.net/docs/ST_GeoHash.html) describes a shorter geohash as a less precise box that contains the point, which makes geohashes searchable by prefix in any database that indexes text. It returns 20 characters for a point unless you ask for fewer, and expects longitude and latitude input.

Store the cell ID beside the coordinate, as a derived column, for aggregation and fast lookups. Keep the coordinate and the real shapes as the source of truth; a territory boundary drawn in cells is an approximation of the one on the map.

## Checklist

- WGS 84 longitude and latitude everywhere data is stored or exchanged; anything else is converted at import.
- Named `latitude` and `longitude` fields in APIs; GeoJSON, as `application/geo+json`, for shapes.
- One function swaps between GeoJSON order and the map library's order, with a test fixture that can't survive a swap.
- Six decimal places on output, and the accuracy or geocode precision stored in its own column.
- Polygons normalized on import: closed rings, right-hand winding, split at the antimeridian.
- `geography` columns with GiST indexes by default; `geometry` for heavy processing or projected data.
- `ST_DWithin` for distance filters; `ST_Covers` for point-in-polygon.
- Other formats at the edges: WKB to the database, TopoJSON or vector tiles to map clients, GeoParquet to the warehouse, GeoPackage to GIS tools.

## References

**Specifications**

- [RFC 7946: The GeoJSON Format](https://datatracker.ietf.org/doc/html/rfc7946), geometry types, coordinate order, WGS 84, winding, antimeridian cutting and precision
- [OGC Simple Feature Access](https://www.ogc.org/standards/sfa/), the geometry model behind WKT and WKB
- [TopoJSON specification](https://github.com/topojson/topojson-specification), shared arcs and quantization
- [Mapbox Vector Tile specification](https://github.com/mapbox/vector-tile-spec), version 2.1
- [GeoParquet](https://geoparquet.org/) and its [specification repository](https://github.com/opengeospatial/geoparquet)
- [GeoPackage](https://www.geopackage.org/), the OGC SQLite container
- [OGC KML](https://www.ogc.org/standards/kml/), version 2.3
- [GPX 1.1](https://www.topografix.com/gpx.asp), the GPS Exchange Format

**Reference**

- [PostGIS: Data Management](https://postgis.net/docs/using_postgis_dbmanagement.html), geometry versus geography, WKT, WKB, EWKT and SRIDs
- [PostGIS: ST_MakePoint](https://postgis.net/docs/ST_MakePoint.html), X as longitude and Y as latitude
- [PostGIS: ST_GeomFromGeoJSON](https://postgis.net/docs/ST_GeomFromGeoJSON.html) and [ST_AsGeoJSON](https://postgis.net/docs/ST_AsGeoJSON.html), reading and writing GeoJSON
- [PostGIS: ST_DWithin](https://postgis.net/docs/ST_DWithin.html), index-assisted distance filters in meters
- [PostGIS Workshop: Spatial Indexing](https://postgis.net/workshops/postgis-intro/indexing.html), GiST indexes over bounding boxes
- [Google: Encoded Polyline Algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm), the encoding and its precision
- [Google Maps JavaScript API: LatLng](https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLng) and [Leaflet: LatLng](https://leafletjs.com/reference.html#latlng), latitude-first map libraries
- [FlatGeobuf](https://flatgeobuf.org/), binary features with a spatial index and HTTP range requests
- [H3](https://h3geo.org/docs/) and [S2](https://s2geometry.io/), hierarchical cell systems
- [PostGIS: ST_GeoHash](https://postgis.net/docs/ST_GeoHash.html), geohash encoding and its prefix property
- [Google: KML Reference](https://developers.google.com/kml/documentation/kmlreference), elements and `lon,lat[,alt]` coordinate tuples
- [Esri: Shapefile Technical Description](https://www.esri.com/content/dam/esrisites/sitecore-archive/Files/Pdfs/library/whitepapers/pdfs/shapefile.pdf), the July 1998 white paper defining the `.shp`, `.shx` and `.dbf` files
- [orb](https://pkg.go.dev/github.com/paulmach/orb/geojson), GeoJSON for Go
- [geojson](https://docs.rs/geojson/latest/geojson/), GeoJSON for Rust
