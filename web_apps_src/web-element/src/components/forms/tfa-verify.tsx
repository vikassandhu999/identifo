import { StateTFAVerify, StatePasswordForgotTFAVerify } from '@identifo/identifo-auth-js';
import { Component, h, State } from '@stencil/core';
import { Subscription } from 'rxjs';
import { CDKService } from '../../services/cdk.service';

@Component({
  tag: 'identifo-form-tfa-verify',
  styleUrl: '../../styles/identifo-form/main.scss',
  assetsDirs: ['assets'],
  shadow: false,
})
export class IdentifoFormTFASetup {
  @State() state: StateTFAVerify | StatePasswordForgotTFAVerify;
  @State() tfaCode: string;

  subscription: Subscription;
  connectedCallback() {
    this.subscription = CDKService.cdk.state.subscribe(state => (this.state = state as StateTFAVerify | StatePasswordForgotTFAVerify));
  }
  disconnectedCallback() {
    this.subscription.unsubscribe();
  }

  tfaCodeChange(event: InputEvent) {
    this.tfaCode = (event.target as HTMLInputElement).value;
  }

  verify() {
    this.state.verifyTFA(this.tfaCode);
  }

  render() {
    return (
      <div class="tfa-verify">
        {this.state.route.indexOf('app') > 0 && (
          <div class="tfa-verify__title-wrapper">
            <h2 class="tfa-verify__title">Enter the code from authenticator app</h2>
            <p class="tfa-verify__subtitle">Code will be generated by app</p>
          </div>
        )}
        {this.state.route.indexOf('sms') > 0 && (
          <div class="tfa-verify__title-wrapper">
            <h2 class="tfa-verify__title">Enter the code sent to your phone number</h2>
            <p class="tfa-verify__subtitle">The code has been sent to {this.state.phone}</p>
          </div>
        )}
        {this.state.route.indexOf('email') > 0 && (
          <div class="tfa-verify__title-wrapper">
            <h2 class="tfa-verify__title">Enter the code sent to your email address</h2>
            <p class="tfa-verify__subtitle">The email has been sent to {this.state.email}</p>
          </div>
        )}
        <input
          type="text"
          class={`form-control ${this.state.error && 'form-control-danger'}`}
          id="tfaCode"
          value={this.tfaCode}
          placeholder="Verify code"
          onInput={event => this.tfaCodeChange(event as InputEvent)}
          onKeyPress={e => !!(e.key === 'Enter' && this.tfaCode) && this.verify()}
        />
        <identifo-form-error-alert></identifo-form-error-alert>
        <button type="button" class={`primary-button ${this.state.error && 'primary-button-mt-32'}`} disabled={!this.tfaCode} onClick={() => this.verify()}>
          Confirm
        </button>
        <identifo-form-goback></identifo-form-goback>
      </div>
    );
  }
}
