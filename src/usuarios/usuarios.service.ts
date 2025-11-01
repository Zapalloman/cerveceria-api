import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario } from './schemas/usuario.schema';
import { Direccion } from './schemas/direccion.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Direccion.name) private direccionModel: Model<Direccion>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioModel
      .findOne({ email: createUsuarioDto.email })
      .exec();

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = new this.usuarioModel({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    return usuario.save();
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.find({ activo: true }).select('-password').exec();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id).select('-password').exec();
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findOne({ email }).exec();
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // Si se actualiza el password, hashearlo
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, updateUsuarioDto, { new: true })
      .select('-password')
      .exec();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async remove(id: string): Promise<Usuario> {
    // Soft delete
    return this.update(id, { activo: false } as any);
  }

  // Métodos para direcciones
  async agregarDireccion(usuarioId: string, direccionData: any): Promise<Direccion> {
    const direccion = new this.direccionModel({
      ...direccionData,
      usuarioId,
    });
    
    const saved = await direccion.save();
    
    // Agregar a usuario
    await this.usuarioModel.findByIdAndUpdate(usuarioId, {
      $push: { direcciones: saved._id },
    });
    
    return saved;
  }

  async obtenerDirecciones(usuarioId: string): Promise<Direccion[]> {
    return this.direccionModel.find({ usuarioId }).exec();
  }

  async eliminarDireccion(direccionId: string): Promise<void> {
    await this.direccionModel.findByIdAndDelete(direccionId).exec();
  }
}
