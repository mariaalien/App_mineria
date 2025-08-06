-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "titulo_minero" TEXT,
    "municipio" TEXT,
    "telefono" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "ultimo_acceso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "titulos_mineros" (
    "id" TEXT NOT NULL,
    "numero_titulo" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "clasificacion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fecha_otorgamiento" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "titulos_mineros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_produccion" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "mineral" TEXT NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "municipio_extraccion" TEXT,
    "codigo_municipio_extraccion" TEXT,
    "horas_operativas" DECIMAL(8,2),
    "cantidad_produccion" DECIMAL(15,4),
    "unidad_medida_produccion" TEXT,
    "cantidad_material_entra_planta" DECIMAL(15,4),
    "cantidad_material_sale_planta" DECIMAL(15,4),
    "masa_unitaria" DECIMAL(10,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_inventarios" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "mineral" TEXT NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "unidad_medida_inventarios" TEXT,
    "inventario_inicial_acopio" DECIMAL(15,4),
    "inventario_final_acopio" DECIMAL(15,4),
    "ingreso_acopio" DECIMAL(15,4),
    "salida_acopio" DECIMAL(15,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_inventarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_paradas_produccion" (
    "id" TEXT NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "fecha_inicio_evento" TIMESTAMP(3) NOT NULL,
    "fecha_fin_evento" TIMESTAMP(3) NOT NULL,
    "tipo_parada" TEXT,
    "causa_parada" TEXT,
    "duracion_evento_horas" DECIMAL(8,2),
    "duracion_retoma_operacion" DECIMAL(8,2),
    "impacto_produccion" DECIMAL(15,4),
    "unidad_medida_impacto" TEXT,
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_paradas_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_ejecucion" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "denominacion_frente" TEXT,
    "coordenada_latitud" DECIMAL(10,8),
    "coordenada_longitud" DECIMAL(11,8),
    "metodo_explotacion" TEXT,
    "avance_yacimiento_ejecutado" DECIMAL(15,4),
    "unidad_medida_avance" TEXT,
    "volumen_ejecutado" DECIMAL(15,4),
    "unidad_medida_volumen" TEXT,
    "densidad_manto_ejecutado" DECIMAL(10,4),
    "unidad_medida_densidad" TEXT,
    "frentes_ejecutado" INTEGER,
    "avance_topografia" DECIMAL(15,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_maquinaria_transporte" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "tipo_vehiculo" TEXT,
    "unidad_capacidad_vehiculo" TEXT,
    "capacidad_vehiculo" DECIMAL(10,4),
    "uso_mecanismo" TEXT,
    "unidad_uso_mecanismo" TEXT,
    "densidad_material_transportado" DECIMAL(10,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_maquinaria_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_regalias" (
    "id" TEXT NOT NULL,
    "fecha_corte_declaracion" TIMESTAMP(3) NOT NULL,
    "mineral" TEXT NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "municipio_extraccion" TEXT,
    "codigo_municipio_extraccion" TEXT,
    "cantidad_mineral_extraido" DECIMAL(15,4),
    "unidad_medida_mineral" TEXT,
    "valor_declaracion_regalias" DECIMAL(18,2),
    "valor_otras_contraprestaciones" DECIMAL(18,2),
    "resolucion_upme" TEXT,
    "precio_base_liquidacion" DECIMAL(18,4),
    "porcentaje_regalias" DECIMAL(5,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_regalias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_inventario_maquinaria" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "tipo_maquinaria" TEXT,
    "cantidad_maquinaria" INTEGER,
    "unidad_capacidad_maquinaria" TEXT,
    "capacidad_maquinaria" DECIMAL(15,4),
    "unidad_rendimiento_maquinaria" TEXT,
    "rendimiento_maquinaria" DECIMAL(15,4),
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_inventario_maquinaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_capacidad_tecnologica" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "mineral" TEXT NOT NULL,
    "ubicacion_punto_control" TEXT,
    "forma_control" TEXT,
    "tipo_control" TEXT,
    "material_medido" TEXT,
    "variable_medida" TEXT,
    "unidad_medicion_punto_control" TEXT,
    "tecnologia_medicion" TEXT,
    "tipo_software_control" TEXT,
    "almacenamiento_datos" TEXT,
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_capacidad_tecnologica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fri_proyecciones" (
    "id" TEXT NOT NULL,
    "fecha_corte_informacion" TIMESTAMP(3) NOT NULL,
    "titulo_minero" TEXT NOT NULL,
    "metodo_explotacion" TEXT,
    "mineral" TEXT NOT NULL,
    "capacidad_instalada_extraccion" DECIMAL(15,4),
    "capacidad_instalada_transporte" DECIMAL(15,4),
    "capacidad_instalada_beneficio" DECIMAL(15,4),
    "proyeccion_topografia" DECIMAL(15,4),
    "densidad_manto_proyectado" DECIMAL(10,4),
    "cantidad_proyectado_produccion" DECIMAL(15,4),
    "unidad_medida_cantidad" TEXT,
    "usuario_id" TEXT NOT NULL,
    "sincronizado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fri_proyecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_fri" (
    "id" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registro_id" TEXT NOT NULL,
    "operacion" TEXT NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "usuario_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_fri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "titulos_mineros_numero_titulo_key" ON "titulos_mineros"("numero_titulo");

-- AddForeignKey
ALTER TABLE "fri_produccion" ADD CONSTRAINT "fri_produccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_inventarios" ADD CONSTRAINT "fri_inventarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_paradas_produccion" ADD CONSTRAINT "fri_paradas_produccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_ejecucion" ADD CONSTRAINT "fri_ejecucion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_maquinaria_transporte" ADD CONSTRAINT "fri_maquinaria_transporte_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_regalias" ADD CONSTRAINT "fri_regalias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_inventario_maquinaria" ADD CONSTRAINT "fri_inventario_maquinaria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_capacidad_tecnologica" ADD CONSTRAINT "fri_capacidad_tecnologica_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fri_proyecciones" ADD CONSTRAINT "fri_proyecciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
