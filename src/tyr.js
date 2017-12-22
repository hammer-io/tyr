/* eslint-disable import/prefer-default-export */
export class Tyr {
  constructor(configs) {
    this.configs = configs;
  }

  /**
   * Facilitates generating project files and connecting to third party services
   */
  generateProject() {
    console.log(this.configs);
  }
}
