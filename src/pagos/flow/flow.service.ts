import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface FlowPaymentRequest {
  commerceOrder: string;
  subject: string;
  currency: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  optional?: string;
}

export interface FlowPaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

@Injectable()
export class FlowService {
  private readonly logger = new Logger(FlowService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly apiUrl: string;
  private readonly sandboxMode: boolean;

  constructor(private configService: ConfigService) {
    // Configuración desde variables de entorno
    this.apiKey = this.configService.get<string>('FLOW_API_KEY') || 'DEMO_API_KEY';
    this.secretKey = this.configService.get<string>('FLOW_SECRET_KEY') || 'DEMO_SECRET_KEY';
    this.sandboxMode = this.configService.get<string>('FLOW_SANDBOX') === 'true';
    
    // URL según ambiente
    this.apiUrl = this.sandboxMode
      ? 'https://sandbox.flow.cl/api'
      : 'https://www.flow.cl/api';

    this.logger.log(`FLOW Service iniciado en modo: ${this.sandboxMode ? 'SANDBOX' : 'PRODUCTION'}`);
  }

  /**
   * Genera la firma para autenticar la petición a FLOW
   */
  private generateSignature(params: Record<string, any>): string {
    // Ordenar parámetros alfabéticamente
    const sortedKeys = Object.keys(params).sort();
    
    // Construir string a firmar
    const toSign = sortedKeys
      .map(key => `${key}${params[key]}`)
      .join('');

    // Generar firma HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(toSign)
      .digest('hex');

    return signature;
  }

  /**
   * Crea un pago en FLOW y retorna la URL de redirección
   */
  async createPayment(paymentData: FlowPaymentRequest): Promise<FlowPaymentResponse> {
    try {
      this.logger.log(`Creando pago FLOW para orden: ${paymentData.commerceOrder}`);

      // Parámetros para FLOW
      const params = {
        apiKey: this.apiKey,
        commerceOrder: paymentData.commerceOrder,
        subject: paymentData.subject,
        currency: paymentData.currency,
        amount: paymentData.amount,
        email: paymentData.email,
        urlConfirmation: paymentData.urlConfirmation,
        urlReturn: paymentData.urlReturn,
      };

      // Agregar parámetro opcional si existe
      if (paymentData.optional) {
        params['optional'] = paymentData.optional;
      }

      // Generar firma
      const signature = this.generateSignature(params);

      // En modo SANDBOX, simulamos la respuesta
      if (this.sandboxMode) {
        return this.mockFlowResponse(paymentData);
      }

      // Aquí iría la llamada real a la API de FLOW
      // const response = await axios.post(`${this.apiUrl}/payment/create`, {
      //   ...params,
      //   s: signature,
      // });

      // Por ahora retornamos mock
      return this.mockFlowResponse(paymentData);

    } catch (error) {
      this.logger.error(`Error al crear pago FLOW: ${error.message}`);
      throw new Error('Error al procesar el pago con FLOW');
    }
  }

  /**
   * Verifica el estado de un pago usando el token
   */
  async getPaymentStatus(token: string): Promise<any> {
    try {
      this.logger.log(`Verificando estado del pago con token: ${token}`);

      const params = {
        apiKey: this.apiKey,
        token: token,
      };

      const signature = this.generateSignature(params);

      // En modo SANDBOX, simulamos la respuesta
      if (this.sandboxMode) {
        return this.mockPaymentStatus(token);
      }

      // Aquí iría la llamada real a la API de FLOW
      // const response = await axios.get(`${this.apiUrl}/payment/getStatus`, {
      //   params: {
      //     ...params,
      //     s: signature,
      //   }
      // });

      return this.mockPaymentStatus(token);

    } catch (error) {
      this.logger.error(`Error al verificar estado del pago: ${error.message}`);
      throw new Error('Error al verificar el estado del pago');
    }
  }

  /**
   * Confirma un pago usando el token retornado por FLOW
   */
  async confirmPayment(token: string): Promise<any> {
    try {
      this.logger.log(`Confirmando pago con token: ${token}`);

      const paymentStatus = await this.getPaymentStatus(token);

      if (paymentStatus.status === 2) {
        // Estado 2 = Pago exitoso en FLOW
        this.logger.log(`Pago confirmado exitosamente: ${token}`);
        return {
          success: true,
          status: 'Pagado',
          flowOrder: paymentStatus.flowOrder,
          commerceOrder: paymentStatus.commerceOrder,
          amount: paymentStatus.amount,
          paymentData: paymentStatus.paymentData,
        };
      } else {
        this.logger.warn(`Pago rechazado o pendiente: ${token}`);
        return {
          success: false,
          status: this.getStatusText(paymentStatus.status),
          flowOrder: paymentStatus.flowOrder,
        };
      }

    } catch (error) {
      this.logger.error(`Error al confirmar pago: ${error.message}`);
      throw new Error('Error al confirmar el pago');
    }
  }

  /**
   * Verifica la firma de un webhook de FLOW
   */
  verifyWebhookSignature(params: Record<string, any>, receivedSignature: string): boolean {
    const calculatedSignature = this.generateSignature(params);
    return calculatedSignature === receivedSignature;
  }

  /**
   * Convierte código de estado de FLOW a texto
   */
  private getStatusText(status: number): string {
    const statuses = {
      1: 'Pendiente',
      2: 'Pagado',
      3: 'Rechazado',
      4: 'Cancelado',
    };
    return statuses[status] || 'Desconocido';
  }

  /**
   * Simula una respuesta de FLOW para testing (SANDBOX)
   */
  private mockFlowResponse(paymentData: FlowPaymentRequest): FlowPaymentResponse {
    const token = `FLOW_TOKEN_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const flowOrder = Math.floor(Math.random() * 1000000);

    return {
      url: `${this.apiUrl}/payment/pay?token=${token}`,
      token: token,
      flowOrder: flowOrder,
    };
  }

  /**
   * Simula el estado de un pago para testing (SANDBOX)
   */
  private mockPaymentStatus(token: string): any {
    return {
      flowOrder: Math.floor(Math.random() * 1000000),
      commerceOrder: token.split('_')[2] || 'ORD-' + Date.now(),
      requestDate: new Date().toISOString(),
      status: 2, // 2 = Pagado (para testing)
      subject: 'Compra Cervecería Craft & Beer',
      currency: 'CLP',
      amount: Math.floor(Math.random() * 50000) + 10000,
      payer: 'cliente@test.cl',
      optional: '',
      paymentData: {
        date: new Date().toISOString(),
        media: 'WEBPAY',
        conversionDate: new Date().toISOString(),
        conversionRate: 1,
        amount: Math.floor(Math.random() * 50000) + 10000,
        currency: 'CLP',
        fee: 0,
        balance: 0,
        transferDate: new Date().toISOString(),
      },
    };
  }
}
