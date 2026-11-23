import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useCalendarioDocente } from './hooks/useCalendarioDocente';

import HeaderBar from './components/layout/HeaderBar';
import Sidebar from './components/layout/Sidebar';
import TabsNavigation from './components/layout/TabsNavigation';

import SesionesView from './components/views/SesionesView';
import ResumenHorasView from './components/views/ResumenHorasView';
import AuditoriaChoquesView from './components/views/AuditoriaChoquesView';

import ModalDocente from './components/modals/ModalDocente';
import ModalPrograma from './components/modals/ModalPrograma';
import ModalAsignacion from './components/modals/ModalAsignacion';
import ModalExcepcion from './components/modals/ModalExcepcion';
import ModalCargarRespaldo from './components/modals/ModalCargarRespaldo';
import ModalConfirmacion from './components/modals/ModalConfirmacion';
import ModalExportarDocumentos from './components/modals/ModalExportarDocumentos';

export default function CalendarioDocente() {
  const state = useCalendarioDocente();
  const cantidadChoques = Object.keys(state.mapaDeChoques).length;

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-800 font-sans flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#FFFFFF',
            fontSize: '12px',
            borderRadius: '6px'
          }
        }}
      />

      {/* 1. BARRA SUPERIOR FIJA */}
      <HeaderBar
        docente={state.docente}
        cantidadChoques={cantidadChoques}
        onAbrirCargarRespaldo={() => state.setModalCargarAbierto(true)}
        onAbrirModalExportar={() => state.setModalExportarAbierto(true)}
        onLimpiarTodo={state.solicitarLimpiarTodo}
      />

      {/* 2. CUERPO PRINCIPAL: SIDEBAR FIJA + ÁREA CENTRAL SCROLLABLE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          docente={state.docente}
          programas={state.programas}
          asignaciones={state.asignaciones}
          asignacionSeleccionadaId={state.currentAsig?.id}
          onSeleccionarAsignacion={state.setAsignacionSeleccionadaId}
          onAbrirModalDocente={() => state.setModalDocenteAbierto(true)}
          onAbrirCrearPrograma={() =>
            state.setModalPrograma({ abierto: true, modo: 'crear', datos: null })
          }
          onAbrirEditarPrograma={(prog) =>
            state.setModalPrograma({ abierto: true, modo: 'editar', datos: prog })
          }
          onEliminarPrograma={state.solicitarEliminarPrograma}
          onAbrirCrearAsignacion={(programaId) =>
            state.setModalAsignacion({
              abierto: true,
              modo: 'crear',
              datos: null,
              programaIdPreseleccionado: programaId
            })
          }
          onAbrirEditarAsignacion={(asig) =>
            state.setModalAsignacion({
              abierto: true,
              modo: 'editar',
              datos: asig,
              programaIdPreseleccionado: asig.programaId
            })
          }
          onEliminarAsignacion={state.solicitarEliminarAsignacion}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <TabsNavigation
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            cantidadChoques={cantidadChoques}
          />

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {state.activeTab === 'calendario' && (
              <SesionesView
                currentAsig={state.currentAsig}
                currentPrograma={state.currentPrograma}
                metricasActuales={state.metricasActuales}
                mesesCalendario={state.mesesCalendario}
                todasLasSesiones={state.todasLasSesiones}
                mapaDeChoques={state.mapaDeChoques}
                vistaSesiones={state.vistaSesiones}
                setVistaSesiones={state.setVistaSesiones}
                onClickSesion={state.setModalExcepcion}
              />
            )}

            {state.activeTab === 'metricas' && (
              <ResumenHorasView
                resumenAsignaciones={state.resumenAsignaciones}
                seleccionadasResumen={state.seleccionadasResumen}
                setSeleccionadasResumen={state.setSeleccionadasResumen}
                currentAsig={state.currentAsig}
                metricasActuales={state.metricasActuales}
              />
            )}

            {state.activeTab === 'choques' && (
              <AuditoriaChoquesView
                todasLasSesiones={state.todasLasSesiones}
                mapaDeChoques={state.mapaDeChoques}
              />
            )}
          </div>
        </main>
      </div>

      {/* 3. MODALES */}
      {state.modalDocenteAbierto && (
        <ModalDocente
          docenteInicial={state.docente}
          onGuardar={state.guardarDocente}
          onCerrar={() => state.setModalDocenteAbierto(false)}
        />
      )}

      {state.modalPrograma.abierto && (
        <ModalPrograma
          modo={state.modalPrograma.modo}
          datosIniciales={state.modalPrograma.datos}
          docenteNombre={state.docente?.nombreCompleto || ''}
          onGuardar={state.guardarPrograma}
          onCerrar={() => state.setModalPrograma({ abierto: false, modo: 'crear', datos: null })}
        />
      )}

      {state.modalAsignacion.abierto && (
        <ModalAsignacion
          modo={state.modalAsignacion.modo}
          datosIniciales={state.modalAsignacion.datos}
          programas={state.programas}
          programaIdPreseleccionado={state.modalAsignacion.programaIdPreseleccionado}
          onGuardar={state.guardarAsignacion}
          onCerrar={() =>
            state.setModalAsignacion({
              abierto: false,
              modo: 'crear',
              datos: null,
              programaIdPreseleccionado: null
            })
          }
        />
      )}

      {state.modalExcepcion && (
        <ModalExcepcion
          sesion={state.modalExcepcion}
          configOriginalDia={state.currentAsig?.dias?.[state.modalExcepcion.diaSemanaId]}
          onGuardar={state.guardarExcepcionDia}
          onCerrar={() => state.setModalExcepcion(null)}
        />
      )}

      {state.modalCargarAbierto && (
        <ModalCargarRespaldo
          onCargarArchivo={state.cargarRespaldoDesdeArchivo}
          onCerrar={() => state.setModalCargarAbierto(false)}
        />
      )}

      {state.modalExportarAbierto && (
        <ModalExportarDocumentos
          cantidadSeleccionadas={state.seleccionadasResumen.length}
          totalAsignaciones={state.asignaciones.length}
          onConfirmarDescarga={state.exportarDocumentosSeleccionados}
          onCerrar={() => state.setModalExportarAbierto(false)}
        />
      )}

      <ModalConfirmacion
        abierto={state.modalConfirmacion.abierto}
        titulo={state.modalConfirmacion.titulo}
        mensaje={state.modalConfirmacion.mensaje}
        onConfirmar={state.modalConfirmacion.onConfirmar}
        onCerrar={() => state.setModalConfirmacion((prev) => ({ ...prev, abierto: false }))}
      />
    </div>
  );
}