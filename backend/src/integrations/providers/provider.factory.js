import MockProvider from "./mock.provider.js";

const providers = {
  MOCK: MockProvider,
};

class ProviderFactory {
  static getProvider(providerCode) {
    const ProviderClass = providers[providerCode];

    if (!ProviderClass) {
      throw new Error(`Unsupported provider: ${providerCode}`);
    }

    return new ProviderClass();
  }
}

export default ProviderFactory;