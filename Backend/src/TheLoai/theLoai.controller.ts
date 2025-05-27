import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TheLoaiService } from './theLoai.service';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
@Controller('api/categories')
export class TheLoaiController {
  constructor(private readonly TheLoai: TheLoaiService) {}

  @Post('test')
  @UseInterceptors(AnyFilesInterceptor())
  createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any
  ) {
    console.log('Body:', body);

    const coverImage = files.find((f) => f.fieldname === 'coverImageFile');
    const productImages = files.filter(
      (f) => f.fieldname === 'productImageFiles'
    );

    if (coverImage) {
      console.log('Cover Image:', coverImage);
    } else {
      console.log('No cover image uploaded');
    }

    if (productImages.length > 0) {
      console.log(
        'Product Images:',
        productImages.map((f) => f)
      );
    } else {
      console.log('No product images uploaded');
    }

    return { message: 'Received data' };
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return await this.TheLoai.create(data);
  }

  @Get()
  async findAll(): Promise<Partial<TheLoai>[]> {
    return await this.TheLoai.findAll();
  }

  @Get('/:id')
  async findById(@Param('id') id: number): Promise<any> {
    return await this.TheLoai.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateDto) {
    return await this.TheLoai.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.TheLoai.delete(id);
  }
}
