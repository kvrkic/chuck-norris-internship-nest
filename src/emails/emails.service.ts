import * as nodemailer from 'nodemailer';

import { Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class EmailsService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ACCOUNT_USERNAME,
        pass: process.env.GMAIL_ACCOUNT_PASSWORD,
      },
    });
  }

  public async sendRegistrationMail(
    firstName: string,
    email: string,
    token: string,
  ): Promise<void> {
    const info = {
      from: process.env.GMAIL_ACCOUNT_USERNAME,
      to: email,
      subject: 'Chuck Norris verification',
      html: this.composeRegistrationMail(token, firstName, email),
    };

    await this.transporter.sendMail(info);
  }

  public async sendJokeMail(user: User, joke: string): Promise<void> {
    const info = {
      from: process.env.GMAIL_ACCOUNT_USERNAME,
      to: user.email,
      subject: 'Chuck Norris joke',
      text: joke,
    };

    await this.transporter.sendMail(info);
  }

  private composeRegistrationMail(
    token: string,
    firstName: string,
    email: string,
  ): string {
    return `
        <form method="post" action="http://localhost:3000/users/verify?token=${token}">
            <h2>Chuck Norris Jokes</h2>
            <p>
            Hi ${firstName},
            We just need to verify your email address before you can access the sign in.

            Verify your email address by clicking the button below.
            </p>
            <input style="background-color: #4CAF50;
                border: none;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;"
            type="submit" value="Verify" />
        </form>
        <form method="post" action="http://localhost:3000/users/resend?email=${email}">
          <p>
            <small>
              If the link is no longer working, click <button type="submit">here</button>
            </small>
          </p>
        </form>`;
  }
}
