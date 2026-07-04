export type StatusPartida = "pre" | "live" | "ht" | "ft" | "cancelado";

export interface Bolao {
  id: string;
  nome: string;
  time_casa: string;
  time_fora: string;
  flag_casa: string | null;
  flag_fora: string | null;
  data_partida: string;
  valor_aposta: number;
  fixture_id: number | null;
  status: StatusPartida;
  placar_casa: number;
  placar_fora: number;
  minuto: number | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Participante {
  id: string;
  bolao_id: string;
  nome: string;
  palpite_casa: number;
  palpite_fora: number;
  pago: boolean;
  criado_em: string;
}

export interface Vencedor {
  id: string;
  nome: string;
  palpite: string;
  valor: number;
}
