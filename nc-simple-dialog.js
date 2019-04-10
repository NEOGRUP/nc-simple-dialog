import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/neon-animation/neon-animations.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';

class NcSimpleDialog extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
        paper-dialog {
          width: 400px;
        }
        .header {
          margin-top: 0px;
          @apply --layout-horizontal;
          @apply --layout-center;
        }
        iron-icon {
          margin-right: 12px;
        }
        .buttons {
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        paper-button{
          margin: 10px 5px;
          background-color: var(--app-secondary-color);
          color: white;
        }
      </style>

      <paper-dialog id="simpleDialog" modal entry-animation="scale-up-animation" on-iron-overlay-opened="setFocus">
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="{{dialogIcon}}"></iron-icon><h3>{{localize(dialogTitle)}}</h3>
        </div>
        <div class="content">
          <paper-input id="textInput" hidden$="[[hideTextInput]]" type="text" value="{{formData.textValue}}" required error-message="{{localize('INPUT_ERROR_REQUIRED')}}"></paper-input>
          <paper-input id="numberInput" hidden$="[[hideNumberInput]]" type="number" step="[[dialogInputStep]]" min="[[dialogInputMin]]" max="[[dialogInputMax]]" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_REQUIRED')}}"></paper-input>
        </div>
        <div class="buttons">
          <paper-button raised on-tap="_close" hidden\$="[[dialogCloseButtonDisabled]]">{{localize('BUTTON_CLOSE')}}</paper-button>
          <paper-button raised on-tap="_accept">{{localize('BUTTON_ACCEPT')}}</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get properties() {
    return {
      language: {
        type: String
      },
      formData: {
        type: Object
      },
      urlTranslate: String,
      dialogGroup: String,
      dialogOrigin: String,
      dialogIcon: String,
      dialogTitle: String,
      hideTextInput: {
        type: Boolean,
        value: false
      },
      hideNumberInput: {
        type: Boolean,
        value: true
      },
      dialogInputType: String,
      dialogInputStep: {
        type: Number,
        value: 1
      },
      dialogInputMin: {
        type: Number,
        value: 1
      },
      dialogInputMax: {
        type: Number,
        value: 9999
      },
      
      dialogInputValue: String,
      dialogCloseButtonDisabled: {
        type: Boolean,
        value: false
      },
      // Product, ticket, etc.
      dialogDataAux: {
        type: Object,
        value: {}
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.useKeyIfMissing = true;
    this.loadResources(this.resolveUrl(this.urlTranslate));
  }

  open(){
    this.$.simpleDialog.open();
    this.formData = {};

    if (this.dialogInputType == 'number'){
      this.hideTextInput = true;
      this.hideNumberInput = false;

      // Default values
      if (!this.dialogInputStep){
        this.dialogInputStep = 1;
      }
      
      if (!this.dialogInputMin){
        this.dialogInputMin = 1;
      }
      
      if (!this.dialogInputMax){
        this.dialogInputMax = 9999;
      }

      if (this.dialogInputValue) {
        this.set('formData.numberValue', this.dialogInputValue);
      } 
    } else {
      this.hideTextInput = false;
      this.hideNumberInput = true;
      if (this.dialogInputValue) {
        this.set('formData.textValue', this.dialogInputValue);
      }
    }
  }

  setFocus(){
    if (this.dialogInputType == 'number'){
      this.$.numberInput.focus();
      this.$.numberInput.inputElement.inputElement.select();
    } else{
      this.$.textInput.focus();
      this.$.textInput.inputElement.inputElement.select();
    }
  }

  _accept(){
    if (this._validate()) {
      this.$.simpleDialog.close();

      let formDataValue;

      if (this.dialogInputType == 'number'){
        formDataValue = this.formData.numberValue;
        formDataValue = formDataValue.replace(',','.');
      } else {
        formDataValue = this.formData.textValue;
      }

      this.dispatchEvent(new CustomEvent('accepted', {detail: {value: formDataValue, origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
    }
  }

  _close(){
    this.$.simpleDialog.close();
    this.dispatchEvent(new CustomEvent('closed', {detail: {value: '', origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
  }

  _validate(){
    let input;
    let inputInvalid = false;

    if (this.dialogInputType == 'number'){
      input = this.$.numberInput;
    } else{
      input = this.$.textInput;
    }

    input.validate();
    
    if (input.invalid === true){
      if (this.dialogInputType == 'number'){
        this.$.numberInput.focus();
        this.$.numberInput.inputElement.inputElement.select();
      } else{
        this.$.textInput.focus();
        this.$.textInput.inputElement.inputElement.select();
      }
      inputInvalid = true;
    }

    return !inputInvalid;
  }
}

window.customElements.define('nc-simple-dialog', NcSimpleDialog);
