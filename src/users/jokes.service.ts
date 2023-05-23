import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { JokeData } from './interfaces/joke-data.interface';

@Injectable()
export class JokesService {
  constructor(private readonly httpService: HttpService) {}

  public async fetchJoke(): Promise<string> {
    const { data } = await this.httpService.axiosRef.get<JokeData>(
      process.env.JOKE_URL,
    );

    return data.value;
  }
}
