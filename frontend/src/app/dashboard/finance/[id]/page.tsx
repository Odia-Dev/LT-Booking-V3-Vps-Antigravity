"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  remarks?: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  statusAfter?: string;
  comment: string;
  createdAt: string;
}

interface FinanceApplication {
  id: string;
  financeId: string;
  vehicle?: { name: string };
  branch?: { name: string };
  bankName?: string;
  loanAmount?: number;
  emiAmount?: number;
  interestRate?: number;
  downPayment?: number;
  loanTenure?: number;
  status: string;
  createdAt: string;
  documents?: Document[];
  timelines?: TimelineEvent[];
}

export default function CustomerFinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [application, setApplication] = useState<FinanceApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [docUploadData, setDocUploadData] = useState({ documentType: "AADHAAR" });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/finance/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load application details");

      setApplication(data.application);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoading(false);
    }
  }, [id, apiBaseUrl]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("documents", docFile);
      formData.append("documentType", docUploadData.documentType);

      const res = await fetch(`${apiBaseUrl}/api/finance/${id}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setSuccess("Document uploaded successfully. It is now pending verification.");
      setDocFile(null);
      setDocUploadData({ documentType: "AADHAAR" });
      fetchApplication();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!application) return <div className="p-8 text-center text-red-500">Application not found</div>;

  const isDisbursed = application.status === "DISBURSED";
  const isApproved = ["SANCTION_APPROVED", "DISBURSEMENT_PENDING", "DISBURSED"].includes(application.status);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-2 inline-flex items-center">
            &larr; Back to Applications
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finance Overview</h1>
          <p className="mt-1 text-sm text-gray-600">Application ID: {application.financeId}</p>
        </div>
        <span className={`px-4 py-2 text-sm font-bold rounded-md shadow-sm ${
          isDisbursed ? "bg-green-100 text-green-800" :
          application.status === "SANCTION_REJECTED" ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          Status: {application.status.replace(/_/g, " ")}
        </span>
      </div>

      {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}
      {success && <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Loan Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Loan Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Bank Name</p>
                <p className="font-semibold text-lg text-gray-900">{application.bankName || "Processing..."}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Loan Amount</p>
                <p className="font-semibold text-lg text-gray-900">{application.loanAmount ? `₹${application.loanAmount.toLocaleString()}` : "Processing..."}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Down Payment</p>
                <p className="font-semibold text-lg text-gray-900">{application.downPayment ? `₹${application.downPayment.toLocaleString()}` : "TBD"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Monthly EMI</p>
                <p className="font-semibold text-lg text-gray-900">{application.emiAmount ? `₹${application.emiAmount.toLocaleString()}` : "TBD"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Interest Rate</p>
                <p className="font-semibold text-lg text-gray-900">{application.interestRate ? `${application.interestRate}%` : "TBD"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Tenure</p>
                <p className="font-semibold text-lg text-gray-900">{application.loanTenure ? `${application.loanTenure} months` : "TBD"}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex justify-between">
              <div>
                <p className="text-xs text-gray-500">Approval Status</p>
                <p className={`font-medium ${isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isApproved ? "Approved" : "Pending"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Disbursement Status</p>
                <p className={`font-medium ${isDisbursed ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isDisbursed ? "Completed" : "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Application Updates</h2>
            {application.timelines?.length === 0 ? (
              <p className="text-gray-500 text-sm">No updates yet.</p>
            ) : (
              <ul className="relative border-l border-gray-200 ml-3">
                {application.timelines?.map(event => (
                  <li key={event.id} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-4 h-4 bg-red-100 rounded-full -left-2 ring-4 ring-white">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    </span>
                    <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                      {event.statusAfter ? `Status updated to ${event.statusAfter.replace(/_/g, " ")}` : "Update"}
                    </h3>
                    <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </time>
                    <p className="text-sm font-normal text-gray-600">{event.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Documents */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Document Checklist</h2>
            
            <div className="mb-6">
              {application.documents?.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">You haven't uploaded any documents yet.</p>
              ) : (
                <ul className="space-y-3 mb-4">
                  {application.documents?.map(doc => (
                    <li key={doc.id} className="p-3 bg-gray-50 rounded border text-sm flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{doc.documentType}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{doc.fileName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Upload Requested Document</h3>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={docUploadData.documentType}
                    onChange={(e) => setDocUploadData({ documentType: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="PAN">PAN Card</option>
                    <option value="BANK_STATEMENT">Bank Statement</option>
                    <option value="SALARY_SLIP">Salary Slip</option>
                    <option value="ITR">ITR (Income Tax Return)</option>
                    <option value="FORM_16">Form 16</option>
                    <option value="GST_DOCUMENTS">GST Documents</option>
                    <option value="BUSINESS_PROOF">Business Proof</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select File (PDF, Image)</label>
                  <input
                    type="file"
                    onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm border rounded p-1"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Max size 10MB.</p>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !docFile}
                  className="w-full bg-red-600 text-white py-2 rounded-md font-medium text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
