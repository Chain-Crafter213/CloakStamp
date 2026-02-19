import credits.aleo;
import test_usdcx_stablecoin.aleo;

program cloakstamp_private_v1.aleo {

    // ═══════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════

    struct MerkleProof {
        siblings: [field; 16],
        leaf_index: u32
    }

    // ═══════════════════════════════════════════════════════════════
    // RECORDS — ALL PRIVATE, ENCRYPTED ON-CHAIN
    // ═══════════════════════════════════════════════════════════════

    // Issued to registered certification authorities
    record IssuerLicense {
        owner: address,
        license_commitment: field,
        nonce_seed: field
    }

    // The core certified document — owned by the holder
    record CertifiedDocument {
        owner: address,
        issuer: address,
        doc_hash: field,
        category: field,
        expires_at: u64,
        nonce_seed: field
    }

    // Receipt given to holder after certification
    record HolderReceipt {
        owner: address,
        doc_hash: field,
        issuer: address,
        fee_paid: u64,
        nonce_seed: field
    }

    // Proof token given to verifier after holder proves document
    record VerificationReceipt {
        owner: address,
        doc_commitment: field,
        holder_commitment: field,
        verified_at: u64,
        nonce_seed: field
    }

    // Payment proof for fee transactions
    record PaymentReceipt {
        owner: address,
        amount: u64,
        purpose_hash: field,
        nonce_seed: field
    }

    // ═══════════════════════════════════════════════════════════════
    // MAPPINGS — MINIMAL PUBLIC STATE (commitments + booleans only)
    // ═══════════════════════════════════════════════════════════════

    // Governance: protocol_admin[0u8] = deployer address (only address stored publicly)
    mapping protocol_admin: u8 => address;

    // BHP256(issuer_address) => true — registered certification authorities
    mapping registered_issuers: field => bool;

    // BHP256(doc_hash + issuer_address) => true — certified documents
    mapping document_exists: field => bool;

    // BHP256(doc_hash + issuer_address) => true — revoked documents
    mapping revoked_documents: field => bool;

    // Singleton fee configs: issuance_fees[0u8] = fee in microcredits
    mapping issuance_fees: u8 => u64;

    // Singleton fee configs: verification_fees[0u8] = fee in microcredits
    mapping verification_fees: u8 => u64;

    // Global counters for protocol stats
    mapping total_certifications: u8 => u64;
    mapping total_verifications: u8 => u64;

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR — runs once at deployment, sets up protocol state
    // ═══════════════════════════════════════════════════════════════

    @noupgrade
    async constructor() {}

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: initialize — one-time protocol setup (post-deploy)
    // Only works if protocol_admin is not yet set
    // ═══════════════════════════════════════════════════════════════

    async transition initialize() -> Future {
        let f: Future = finalize_initialize(self.signer);
        return f;
    }

    async function finalize_initialize(caller: address) {
        // Ensure this can only be called once
        let existing_admin: address = Mapping::get_or_use(
            protocol_admin,
            0u8,
            aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc
        );
        assert_eq(existing_admin, aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc);

        // Set caller as protocol admin
        Mapping::set(protocol_admin, 0u8, caller);

        // Default fees: 100_000 microcredits (0.1 ALEO) for issuance, 50_000 for verification
        Mapping::set(issuance_fees, 0u8, 100_000u64);
        Mapping::set(verification_fees, 0u8, 50_000u64);

        // Initialize counters
        Mapping::set(total_certifications, 0u8, 0u64);
        Mapping::set(total_verifications, 0u8, 0u64);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: register_issuer — admin registers a new issuer
    // ═══════════════════════════════════════════════════════════════

    async transition register_issuer(
        issuer: address
    ) -> (IssuerLicense, Future) {
        let issuer_commitment: field = BHP256::hash_to_field(issuer as field);
        let seed: field = BHP256::hash_to_field(self.signer as field + issuer as field);

        let license: IssuerLicense = IssuerLicense {
            owner: issuer,
            license_commitment: issuer_commitment,
            nonce_seed: seed
        };

        let f: Future = finalize_register_issuer(self.signer, issuer_commitment);
        return (license, f);
    }

    async function finalize_register_issuer(
        caller: address,
        issuer_commitment: field
    ) {
        // Only protocol admin can register issuers
        let admin: address = Mapping::get(protocol_admin, 0u8);
        assert_eq(caller, admin);

        // Prevent double registration
        let already: bool = Mapping::get_or_use(registered_issuers, issuer_commitment, false);
        assert(!already);

        Mapping::set(registered_issuers, issuer_commitment, true);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: certify_document — issuer certifies with ALEO payment
    // ═══════════════════════════════════════════════════════════════

    async transition certify_document(
        holder: address,
        doc_hash: field,
        category: field,
        expires_at: u64,
        pay_record: credits.aleo/credits,
        fee_amount: u64
    ) -> (CertifiedDocument, HolderReceipt, PaymentReceipt, credits.aleo/credits, Future) {

        assert(fee_amount > 0u64);

        // Commitment binds document to this specific issuer
        let doc_commitment: field = BHP256::hash_to_field(doc_hash + self.signer as field);
        let issuer_commitment: field = BHP256::hash_to_field(self.signer as field);
        let seed: field = BHP256::hash_to_field(doc_hash + holder as field);

        // Private record for holder — the actual certificate
        let document: CertifiedDocument = CertifiedDocument {
            owner: holder,
            issuer: self.signer,
            doc_hash: doc_hash,
            category: category,
            expires_at: expires_at,
            nonce_seed: seed
        };

        // Receipt for holder
        let holder_receipt: HolderReceipt = HolderReceipt {
            owner: holder,
            doc_hash: doc_hash,
            issuer: self.signer,
            fee_paid: fee_amount,
            nonce_seed: BHP256::hash_to_field(seed + 1field)
        };

        // Payment receipt for issuer (payer)
        let pay_receipt: PaymentReceipt = PaymentReceipt {
            owner: self.signer,
            amount: fee_amount,
            purpose_hash: BHP256::hash_to_field(doc_hash + category),
            nonce_seed: BHP256::hash_to_field(seed + 2field)
        };

        // Lock ALEO fee to program's public balance
        let (change, transfer_f): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(pay_record, self.address, fee_amount);

        let f: Future = finalize_certify_document(
            transfer_f,
            issuer_commitment,
            doc_commitment,
            fee_amount
        );

        return (document, holder_receipt, pay_receipt, change, f);
    }

    async function finalize_certify_document(
        transfer_f: Future,
        issuer_commitment: field,
        doc_commitment: field,
        fee_amount: u64
    ) {
        // Execute the credits transfer
        transfer_f.await();

        // Verify issuer is registered
        let is_registered: bool = Mapping::get_or_use(registered_issuers, issuer_commitment, false);
        assert(is_registered);

        // Verify fee meets minimum
        let min_fee: u64 = Mapping::get_or_use(issuance_fees, 0u8, 0u64);
        assert(fee_amount >= min_fee);

        // Prevent double certification
        let already_exists: bool = Mapping::get_or_use(document_exists, doc_commitment, false);
        assert(!already_exists);

        // Register the document
        Mapping::set(document_exists, doc_commitment, true);

        // Increment counter
        let current_count: u64 = Mapping::get_or_use(total_certifications, 0u8, 0u64);
        Mapping::set(total_certifications, 0u8, current_count + 1u64);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: certify_document_usdcx — issuer certifies with USDCx
    // ═══════════════════════════════════════════════════════════════

    async transition certify_document_usdcx(
        holder: address,
        doc_hash: field,
        category: field,
        expires_at: u64,
        pay_record: test_usdcx_stablecoin.aleo/Token,
        fee_amount: u128,
        fee_recipient: address,
        private proofs: [MerkleProof; 2]
    ) -> (CertifiedDocument, HolderReceipt, test_usdcx_stablecoin.aleo/Token, test_usdcx_stablecoin.aleo/Token, test_usdcx_stablecoin.aleo/ComplianceRecord, Future) {

        let doc_commitment: field = BHP256::hash_to_field(doc_hash + self.signer as field);
        let issuer_commitment: field = BHP256::hash_to_field(self.signer as field);
        let seed: field = BHP256::hash_to_field(doc_hash + holder as field);

        let document: CertifiedDocument = CertifiedDocument {
            owner: holder,
            issuer: self.signer,
            doc_hash: doc_hash,
            category: category,
            expires_at: expires_at,
            nonce_seed: seed
        };

        let holder_receipt: HolderReceipt = HolderReceipt {
            owner: holder,
            doc_hash: doc_hash,
            issuer: self.signer,
            fee_paid: fee_amount as u64,
            nonce_seed: BHP256::hash_to_field(seed + 1field)
        };

        // USDCx transfer: pay fee_recipient (protocol admin)
        let (compliance, token_recipient, token_change, transfer_f): (
            test_usdcx_stablecoin.aleo/ComplianceRecord,
            test_usdcx_stablecoin.aleo/Token,
            test_usdcx_stablecoin.aleo/Token,
            Future
        ) = test_usdcx_stablecoin.aleo/transfer_private(fee_recipient, fee_amount, pay_record, proofs);

        let f: Future = finalize_certify_usdcx(
            transfer_f,
            issuer_commitment,
            doc_commitment,
            fee_amount,
            fee_recipient
        );

        return (document, holder_receipt, token_recipient, token_change, compliance, f);
    }

    async function finalize_certify_usdcx(
        transfer_f: Future,
        issuer_commitment: field,
        doc_commitment: field,
        fee_amount: u128,
        fee_recipient: address
    ) {
        transfer_f.await();

        // Verify fee goes to protocol admin
        let admin: address = Mapping::get(protocol_admin, 0u8);
        assert_eq(fee_recipient, admin);

        // Verify issuer is registered
        let is_registered: bool = Mapping::get_or_use(registered_issuers, issuer_commitment, false);
        assert(is_registered);

        // Verify fee meets minimum (cast u128 to u64 for comparison)
        let min_fee: u64 = Mapping::get_or_use(issuance_fees, 0u8, 0u64);
        assert(fee_amount as u64 >= min_fee);

        // Prevent double certification
        let already_exists: bool = Mapping::get_or_use(document_exists, doc_commitment, false);
        assert(!already_exists);

        Mapping::set(document_exists, doc_commitment, true);

        let current_count: u64 = Mapping::get_or_use(total_certifications, 0u8, 0u64);
        Mapping::set(total_certifications, 0u8, current_count + 1u64);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: prove_document — holder proves to verifier with ALEO fee
    // ═══════════════════════════════════════════════════════════════

    async transition prove_document(
        doc: CertifiedDocument,
        verifier: address,
        pay_record: credits.aleo/credits,
        fee_amount: u64
    ) -> (CertifiedDocument, VerificationReceipt, PaymentReceipt, credits.aleo/credits, Future) {

        // Only the document holder can prove
        assert_eq(doc.owner, self.signer);
        assert(fee_amount > 0u64);

        let doc_commitment: field = BHP256::hash_to_field(doc.doc_hash + doc.issuer as field);
        let holder_commitment: field = BHP256::hash_to_field(self.signer as field);
        let seed: field = BHP256::hash_to_field(doc.doc_hash + verifier as field);

        // Re-create document for holder (consumed as input, must re-issue)
        let refreshed_doc: CertifiedDocument = CertifiedDocument {
            owner: self.signer,
            issuer: doc.issuer,
            doc_hash: doc.doc_hash,
            category: doc.category,
            expires_at: doc.expires_at,
            nonce_seed: BHP256::hash_to_field(doc.nonce_seed + 1field)
        };

        // Verification receipt for the verifier
        let v_receipt: VerificationReceipt = VerificationReceipt {
            owner: verifier,
            doc_commitment: doc_commitment,
            holder_commitment: holder_commitment,
            verified_at: 0u64,
            nonce_seed: BHP256::hash_to_field(seed + 1field)
        };

        // Payment receipt for holder
        let pay_receipt: PaymentReceipt = PaymentReceipt {
            owner: self.signer,
            amount: fee_amount,
            purpose_hash: BHP256::hash_to_field(doc_commitment + verifier as field),
            nonce_seed: BHP256::hash_to_field(seed + 2field)
        };

        // Pay verification fee
        let (change, transfer_f): (credits.aleo/credits, Future) =
            credits.aleo/transfer_private_to_public(pay_record, self.address, fee_amount);

        let f: Future = finalize_prove_document(
            transfer_f,
            doc_commitment,
            doc.expires_at,
            fee_amount
        );

        return (refreshed_doc, v_receipt, pay_receipt, change, f);
    }

    async function finalize_prove_document(
        transfer_f: Future,
        doc_commitment: field,
        expires_at: u64,
        fee_amount: u64
    ) {
        transfer_f.await();

        // Verify document exists on-chain
        let exists: bool = Mapping::get_or_use(document_exists, doc_commitment, false);
        assert(exists);

        // Verify document is NOT revoked
        let is_revoked: bool = Mapping::get_or_use(revoked_documents, doc_commitment, false);
        assert(!is_revoked);

        // Verify document is NOT expired (0 = no expiry)
        let now: u64 = block.height as u64;
        let valid_expiry: bool = expires_at == 0u64 || now <= expires_at;
        assert(valid_expiry);

        // Verify fee meets minimum
        let min_fee: u64 = Mapping::get_or_use(verification_fees, 0u8, 0u64);
        assert(fee_amount >= min_fee);

        // Increment verification counter
        let current_count: u64 = Mapping::get_or_use(total_verifications, 0u8, 0u64);
        Mapping::set(total_verifications, 0u8, current_count + 1u64);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRANSITION: revoke_document — issuer revokes a previously certified doc
    // ═══════════════════════════════════════════════════════════════

    async transition revoke_document(
        doc_hash: field
    ) -> Future {
        // Commitment binds to this issuer's address
        let doc_commitment: field = BHP256::hash_to_field(doc_hash + self.signer as field);
        let issuer_commitment: field = BHP256::hash_to_field(self.signer as field);

        let f: Future = finalize_revoke_document(issuer_commitment, doc_commitment);
        return f;
    }

    async function finalize_revoke_document(
        issuer_commitment: field,
        doc_commitment: field
    ) {
        // Verify issuer is registered
        let is_registered: bool = Mapping::get_or_use(registered_issuers, issuer_commitment, false);
        assert(is_registered);

        // Verify document exists
        let exists: bool = Mapping::get_or_use(document_exists, doc_commitment, false);
        assert(exists);

        // Prevent double revocation
        let already_revoked: bool = Mapping::get_or_use(revoked_documents, doc_commitment, false);
        assert(!already_revoked);

        Mapping::set(revoked_documents, doc_commitment, true);
    }
}
