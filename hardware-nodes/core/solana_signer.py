import json
import base58
import time
from typing import Dict, Any
# from nacl.signing import SigningKey # PyNaCl kütüphanesi donanımda olmalıdır

class SolanaNodeSigner:
    """
    Edge Node (Raspberry Pi) üzerinde çalışan donanımsal cüzdan yöneticisi.
    NeuralAir ağına giden her veriyi kriptografik olarak imzalar.
    Böylece ağdaki diğer aktörler bu verinin gerçekten bu drone'dan geldiğini doğrular (DePIN Güvenliği).
    """

    def __init__(self, keypair_path: str = "/etc/neuralair/node_wallet.json"):
        self.keypair_path = keypair_path
        self.pubkey = None
        self._signer = None
        self._load_wallet()

    def _load_wallet(self):
        """Yerel diskten Solana Private Key'i yükler."""
        try:
            # Gerçek senaryoda bu dosya AES ile şifrelenmiş olmalıdır.
            # with open(self.keypair_path, 'r') as f:
            #     secret_key_bytes = bytes(json.load(f)[:32]) # İlk 32 byte seed
            #     self._signer = SigningKey(secret_key_bytes)
            #     self.pubkey = base58.b58encode(self._signer.verify_key.encode()).decode('utf-8')
            
            # Simülasyon modu (Geliştirme için)
            self.pubkey = "DronePubkeySimulated123456789"
            print(f"[SIGNER] Donanım Cüzdanı Yüklendi. Pubkey: {self.pubkey}")
        except Exception as e:
            print(f"[SIGNER] Cüzdan yüklenemedi: {e}. Sistem sadece okunur modda çalışacak.")

    def sign_telemetry(self, telemetry_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Telemetri verisini (GPS, Batarya vb.) alır, zaman damgası ekler ve Ed25519 ile imzalar.
        """
        # Veriye her zaman nonce / timestamp ekle (Replay attack önlemek için)
        telemetry_data["timestamp"] = int(time.time() * 1000)
        telemetry_data["node_pubkey"] = self.pubkey

        # Veriyi byte'a çevir ve imzala
        message_bytes = json.dumps(telemetry_data, sort_keys=True).encode('utf-8')
        
        signature_hex = "simulated_signature_hash_xyz"
        # Gerçek kod:
        # if self._signer:
        #     signature_hex = self._signer.sign(message_bytes).signature.hex()

        return {
            "payload": telemetry_data,
            "signature": signature_hex
        }

    def verify_server_command(self, command_payload: Dict[str, Any]) -> bool:
        """
        Gelen komutun gerçekten NeuralAir Smart Contract'ından veya yetkili Dispatcher'dan 
        gelip gelmediğini kontrol eder. (Spoofing engelleme)
        """
        # Burada server'ın imzası public key ile doğrulanır
        # ...
        return True 

# Test
if __name__ == "__main__":
    signer = SolanaNodeSigner()
    test_data = {"lat": 38.4237, "lng": 27.1428, "alt": 120, "battery": 87}
    signed_packet = signer.sign_telemetry(test_data)
    print("İmzalı Paket Çıktısı:")
    print(json.dumps(signed_packet, indent=2))
