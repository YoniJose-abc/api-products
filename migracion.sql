-- Origen: postgres-productos / productos_db, consultado en modo READ ONLY.
-- Ejecutar en la base de destino con psql -X -v ON_ERROR_STOP=1.
BEGIN;

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1
    NO CYCLE;

CREATE TABLE public.productos (
    id integer DEFAULT nextval('public.productos_id_seq'::regclass) NOT NULL,
    nombre character varying(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    categoria character varying(100),
    CONSTRAINT productos_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;

INSERT INTO public.productos (id, nombre, precio, categoria) VALUES
    (1, 'Teclado Logitech', 350.00, 'Accesorios'),
    (2, 'Mouse Logitech', 250.00, 'Accesorios'),
    (3, 'Monitor Samsung', 3200.00, 'Electronica'),
    (4, 'Memoria USB Kingston', 180.00, 'Almacenamiento'),
    (5, 'Laptop HP', 12500.00, 'Computadoras'),
    (6, 'Audifonos Sony', 850.00, 'Audio'),
    (7, 'Disco SSD Kingston 480GB', 750.00, 'Almacenamiento'),
    (8, 'Webcam Logitech HD', 620.00, 'Accesorios'),
    (9, 'Impresora Epson', 4200.00, 'Impresoras'),
    (10, 'Memoria RAM 16GB', 950.00, 'Componentes'),
    (11, 'Mouse Gamer Redragon', 480.00, 'Accesorios'),
    (12, 'Monitor LG 24 pulgadas', 2800.00, 'Electronica'),
    (13, 'Disco Duro Externo 1TB', 1350.00, 'Almacenamiento'),
    (14, 'Bocinas Logitech', 690.00, 'Audio'),
    (15, 'Laptop Lenovo IdeaPad', 13900.00, 'Computadoras');

-- Estado local observado: last_value = 15, is_called = true.
-- RESTART es transaccional y hace que el siguiente ID sea 16.
ALTER SEQUENCE public.productos_id_seq RESTART WITH 16;

COMMIT;
