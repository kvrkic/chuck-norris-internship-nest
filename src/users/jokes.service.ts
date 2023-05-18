import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JokeData } from 'src/auth/interfaces/token-payload.interface';

@Injectable()
export class JokesService {
  constructor(private readonly httpService: HttpService) {}

  public async getJoke(): Promise<string> {
    const { data } = await this.httpService.axiosRef.get<JokeData>(
      process.env.JOKE_URL,
    );

    return data.value;
  }
}
