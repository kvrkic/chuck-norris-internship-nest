import { HttpService } from '@nestjs/axios';

import { JokesService } from './jokes.service';

describe('JokesService', () => {
  const httpService = {
    axiosRef: {
      get: jest.fn(() => ({
        data: { value: 'Chuck Norris Joke' },
      })),
    },
  } as unknown as HttpService;

  const mockJokesService = new JokesService(httpService);

  it('should fetch joke', async () => {
    process.env.JOKE_URL = 'ehehehe';

    const joke = await mockJokesService.fetchJoke();

    expect(httpService.axiosRef.get).toBeCalledTimes(1);
    expect(httpService.axiosRef.get).toBeCalledWith('ehehehe');

    expect(joke).toEqual('Chuck Norris Joke');
  });
});
