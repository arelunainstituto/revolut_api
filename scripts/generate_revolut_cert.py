#!/usr/bin/env python3
"""
Revolut Certificate Generator
Generates X.509 certificates for Revolut Business API authentication.

Usage:
    python3 generate_revolut_cert.py

Output:
    - private_key.pem: Private key (keep secret!)
    - certificate.pem: Public certificate (upload to Revolut)
    - public_key.pem: Public key (optional, for verification)

Author: Grupo AreLuna
Date: November 3, 2024
"""

import os
import sys
from datetime import datetime, timedelta

def check_dependencies():
    """Check if required dependencies are available."""
    try:
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization, hashes
        from cryptography.x509 import (
            CertificateBuilder,
            Name,
            NameAttribute,
            SubjectAlternativeName,
            DNSName
        )
        from cryptography.x509.oid import NameOID
        return True
    except ImportError:
        print("❌ Error: cryptography library not found")
        print("\nInstalling cryptography library...")
        os.system(f"{sys.executable} -m pip install cryptography")
        print("\n✅ Installation complete. Please run the script again.")
        return False

def generate_certificates():
    """Generate private key and X.509 certificate."""
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.backends import default_backend
    from cryptography.x509 import (
        CertificateBuilder,
        Name,
        NameAttribute,
        SubjectAlternativeName,
        DNSName
    )
    from cryptography.x509.oid import NameOID

    print("=" * 80)
    print(" " * 20 + "🔐 Revolut Certificate Generator 🔐")
    print("=" * 80)
    print()

    # Generate private key
    print("📝 Generating RSA private key (2048 bits)...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    print("✅ Private key generated")

    # Extract public key
    print("\n📝 Extracting public key...")
    public_key = private_key.public_key()
    print("✅ Public key extracted")

    # Get user input for certificate details
    print("\n" + "=" * 80)
    print("Certificate Information (press Enter for defaults)")
    print("=" * 80)

    country = input("Country Code (PT): ").strip() or "PT"
    state = input("State/Province (Lisboa): ").strip() or "Lisboa"
    locality = input("City (Lisboa): ").strip() or "Lisboa"
    organization = input("Organization (AreLuna): ").strip() or "AreLuna"
    org_unit = input("Organizational Unit (Development): ").strip() or "Development"
    common_name = input("Common Name (revolut-api.areluna.com): ").strip() or "revolut-api.areluna.com"
    email = input("Email (api@areluna.com): ").strip() or "api@areluna.com"

    # Create certificate
    print("\n📝 Creating X.509 certificate...")
    subject = issuer = Name([
        NameAttribute(NameOID.COUNTRY_NAME, country),
        NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, state),
        NameAttribute(NameOID.LOCALITY_NAME, locality),
        NameAttribute(NameOID.ORGANIZATION_NAME, organization),
        NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, org_unit),
        NameAttribute(NameOID.COMMON_NAME, common_name),
        NameAttribute(NameOID.EMAIL_ADDRESS, email),
    ])

    cert = (
        CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(public_key)
        .serial_number(int.from_bytes(os.urandom(20), byteorder='big'))
        .not_valid_before(datetime.utcnow())
        .not_valid_after(datetime.utcnow() + timedelta(days=365))
        .add_extension(
            SubjectAlternativeName([DNSName(common_name)]),
            critical=False,
        )
        .sign(private_key, hashes.SHA256(), default_backend())
    )
    print("✅ Certificate created (valid for 365 days)")

    # Save private key
    print("\n📝 Saving private key to private_key.pem...")
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    with open('private_key.pem', 'wb') as f:
        f.write(private_key_pem)
    os.chmod('private_key.pem', 0o600)  # Set secure permissions
    print("✅ Private key saved (permissions set to 600)")

    # Save certificate
    print("\n📝 Saving certificate to certificate.pem...")
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    with open('certificate.pem', 'wb') as f:
        f.write(cert_pem)
    print("✅ Certificate saved")

    # Save public key
    print("\n📝 Saving public key to public_key.pem...")
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open('public_key.pem', 'wb') as f:
        f.write(public_key_pem)
    print("✅ Public key saved")

    # Display certificate info
    print("\n" + "=" * 80)
    print("📋 Certificate Details")
    print("=" * 80)
    print(f"Subject: {common_name}")
    print(f"Organization: {organization}")
    print(f"Valid From: {datetime.utcnow().strftime('%Y-%m-%d')}")
    print(f"Valid Until: {(datetime.utcnow() + timedelta(days=365)).strftime('%Y-%m-%d')}")

    # Display next steps
    print("\n" + "=" * 80)
    print("✅ SUCCESS! Certificates generated successfully")
    print("=" * 80)
    print()
    print("📁 Files created:")
    print("   ├── private_key.pem   (Keep SECRET! Never share or commit)")
    print("   ├── certificate.pem   (Upload to Revolut Business portal)")
    print("   └── public_key.pem    (Optional, for verification)")
    print()
    print("🔐 File permissions:")
    print(f"   private_key.pem: {oct(os.stat('private_key.pem').st_mode)[-3:]} (secure)")
    print()
    print("📤 Next Steps:")
    print()
    print("1. Upload certificate to Revolut:")
    print("   → Go to: https://business.revolut.com/settings/api/keys")
    print("   → Click: 'Add Certificate'")
    print("   → Upload: certificate.pem")
    print("   → Copy the Client ID you receive")
    print()
    print("2. Update your .env file:")
    print("   → REVOLUT_CLIENT_ID=<paste_client_id_here>")
    print("   → REVOLUT_PRIVATE_KEY_PATH=./private_key.pem")
    print()
    print("3. Test your setup:")
    print("   → npm run dev")
    print("   → curl http://localhost:3005/api/health")
    print()
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("   • NEVER commit private_key.pem to Git")
    print("   • Verify .gitignore includes *.pem")
    print("   • Backup private_key.pem securely")
    print("   • Set expiry reminder for 1 year from now")
    print()
    print("=" * 80)

def main():
    """Main function."""
    if not check_dependencies():
        sys.exit(1)

    try:
        generate_certificates()
    except KeyboardInterrupt:
        print("\n\n❌ Certificate generation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error generating certificates: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
