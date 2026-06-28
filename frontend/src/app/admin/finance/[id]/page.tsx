"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  expiryDate?: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  statusBefore?: string;
  statusAfter?: string;
  comment: string;
  performedBy?: string;
  createdAt: string;
}

interface FinanceApplication {
  id: string;
  financeId: string;
  bookingId: string;
  customer?: { name: string; phone: string; email: string };
  vehicle?: { name: string };
  branch?: { name: string };
  bankName?: string;
  loanAmount?: number;
  emiAmount?: number;
  interestRate?: number;
  downPayment?: number;
  loanTenure?: number;
  status: string;
  notes?: string;
  assignedExecutive?: string;
  createdAt: string;
  documents?: Document[];
  timelines?: TimelineEvent[];
}

export default function FinanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [application, setApplication] = useState<FinanceApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    loanAmount: "",
    emiAmount: "",
    interestRate: "",
    downPayment: "",
    loanTenure: "",
    status: "",
    notes: "",
  });

  const [docUploadData, setDocUploadData] = useState({
    documentType: "AADHAAR",
    remarks: "",
    expiryDate: "",
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/finance/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load application");

      setApplication(data.application);
      setFormData({
        bankName: data.application.bankName || "",
        loanAmount: data.application.loanAmount || "",
        emiAmount: data.application.emiAmount || "",
        interestRate: data.application.interestRate || "",
        downPayment: data.application.downPayment || "",
        loanTenure: data.application.loanTenure || "",
        status: data.application.status || "",
        notes: data.application.notes || "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoading(false);
    }
  }, [id, apiBaseUrl]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        bankName: formData.bankName || null,
        loanAmount: formData.loanAmount ? Number(formData.loanAmount) : null,
        emiAmount: formData.emiAmount ? Number(formData.emiAmount) : null,
        interestRate: formData.interestRate ? Number(formData.interestRate) : null,
        downPayment: formData.downPayment ? Number(formData.downPayment) : null,
        loanTenure: formData.loanTenure ? Number(formData.loanTenure) : null,
        status: formData.status,
        notes: formData.notes || null,
      };

      const res = await fetch(`${apiBaseUrl}/api/finance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccess("Application updated successfully");
      fetchApplication();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

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
      const formDataObj = new FormData();
      formDataObj.append("documents", docFile);
      formDataObj.append("documentType", docUploadData.documentType);
      if (docUploadData.remarks) formDataObj.append("remarks", docUploadData.remarks);
      if (docUploadData.expiryDate) formDataObj.append("expiryDate", docUploadData.expiryDate);

      const res = await fetch(`${apiBaseUrl}/api/finance/${id}/documents`, {
        method: "POST",
        body: formDataObj,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setSuccess("Document uploaded successfully");
      setDocFile(null);
      setDocUploadData({ documentType: "AADHAAR", remarks: "", expiryDate: "" });
      fetchApplication();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!application) return <div className="p-8 text-center text-red-500">Application not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Finance Details: {application.financeId}</h1>
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">&larr; Back</button>
      </div>

      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Info Card */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-1 border">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Customer Info</h2>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Name:</span> {application.customer?.name}</p>
            <p><span className="font-medium">Phone:</span> {application.customer?.phone}</p>
            <p><span className="font-medium">Email:</span> {application.customer?.email}</p>
          </div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4 mt-6">Vehicle Info</h2>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Model:</span> {application.vehicle?.name}</p>
            <p><span className="font-medium">Branch:</span> {application.branch?.name}</p>
          </div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4 mt-6">Application Info</h2>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Date:</span> {new Date(application.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">Executive:</span> {application.assignedExecutive || "Unassigned"}</p>
            <p><span className="font-medium">Booking ID:</span> {application.bookingId}</p>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2 border">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Finance Details & Status</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="INITIATED">Initiated</option>
                  <option value="DOCUMENT_PENDING">Document Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SANCTION_APPROVED">Sanction Approved</option>
                  <option value="SANCTION_REJECTED">Sanction Rejected</option>
                  <option value="DISBURSEMENT_PENDING">Disbursement Pending</option>
                  <option value="DISBURSED">Disbursed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMI Amount (₹)</label>
                <input
                  type="number"
                  value={formData.emiAmount}
                  onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (₹)</label>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Tenure (Months)</label>
                <input
                  type="number"
                  value={formData.loanTenure}
                  onChange={(e) => setFormData({ ...formData, loanTenure: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Document Checklist & Upload */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Documents</h2>
          <div className="space-y-4">
            {application.documents?.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <ul className="divide-y text-sm">
                {application.documents?.map((doc: Document) => (
                  <li key={doc.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{doc.documentType}</p>
                      <p className="text-xs text-gray-500">{doc.fileName} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      {doc.expiryDate && (
                        <p className={`text-xs ${new Date(doc.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a href={`${apiBaseUrl}/api/finance/${id}/documents/${doc.id}/preview`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Preview</a>
                      <a href={`${apiBaseUrl}/api/finance/${id}/documents/${doc.id}/download`} className="text-green-600 hover:underline text-xs">Download</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Upload New Document</h3>
              <form onSubmit={handleUploadDocument} className="space-y-3 bg-gray-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={docUploadData.documentType}
                    onChange={(e) => setDocUploadData({ ...docUploadData, documentType: e.target.value })}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="BANK_STATEMENT">Bank Statement</option>
                    <option value="SALARY_SLIP">Salary Slip</option>
                    <option value="ITR">ITR</option>
                    <option value="FORM_16">Form 16</option>
                    <option value="GST_DOCUMENTS">GST Documents</option>
                    <option value="BUSINESS_PROOF">Business Proof</option>
                    <option value="SANCTION_LETTER">Sanction Letter</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    type="date"
                    value={docUploadData.expiryDate}
                    onChange={(e) => setDocUploadData({ ...docUploadData, expiryDate: e.target.value })}
                    className="border rounded px-2 py-1 text-sm"
                    title="Expiry Date"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Remarks (Optional)"
                  value={docUploadData.remarks}
                  onChange={(e) => setDocUploadData({ ...docUploadData, remarks: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                />
                <button
                  type="submit"
                  disabled={isUploading || !docFile}
                  className="w-full bg-gray-800 text-white py-1 rounded text-sm hover:bg-gray-900 disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">Timeline</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {application.timelines?.length === 0 ? (
              <p className="text-sm text-gray-500">No timeline events recorded.</p>
            ) : (
              <div className="relative border-l border-gray-200 ml-3">
                {application.timelines?.map((event: TimelineEvent) => (
                  <div key={event.id} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </span>
                    <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                      {event.statusAfter || event.comment}
                    </h3>
                    <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                      {new Date(event.createdAt).toLocaleString()} • by {event.performedBy || "SYSTEM"}
                    </time>
                    <p className="text-sm font-normal text-gray-500">{event.comment}</p>
                    {event.statusBefore && event.statusBefore !== event.statusAfter && (
                      <p className="text-xs text-gray-400 mt-1">Status changed from {event.statusBefore}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
