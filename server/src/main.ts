import '@shared/config/crud.config';
import { AppModule } from 'src/app.module';
import { bootstrapNraApplication } from '@shared/utils/bootstrap.util';

bootstrapNraApplication(AppModule, {
  swaggerTitle: 'react-admin-nestjs',
  swaggerDescription: 'Demo website description',
  swaggerTag: 'demo',
});
