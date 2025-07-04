"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, AlertCircle, Eye } from "lucide-react";
import { useState, useRef } from "react";
import React from "react";
import Papa from "papaparse";
import { Input } from "./ui/input";

interface CSVDialogProps {
  dialogLabel?: string;
  icon?: React.ReactNode;
}

type Lead = {
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  position?: string;
  linkedin?: string;
  status?: string;
  tags?: string;
  location?: string;
  [key: string]: string | undefined;
};

export const CSVDialog = ({ dialogLabel, icon }: CSVDialogProps) => {
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [parsedData, setParsedData] = useState<Lead[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validLeads, setValidLeads] = useState<Lead[]>([]);
  const [invalidLeads, setInvalidLeads] = useState<Lead[]>([]);
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([]);

  const [fieldMap, setFieldMap] = useState<{
    email?: string;
    name?: string;
    phone?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    status?: string;
    tags?: string;
    location?: string;
  }>({});

  const allowedFields = [
    "email",
    "name",
    "phone",
    "company",
    "position",
    "linkedin",
    "tags",
    "location",
  ];

  const parseCSVFile = (file: File) => {
    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const headers = results.meta.fields as string[];
        setParsedData(results.data as Lead[]);
        setCsvHeaders(headers);

        const map: Record<string, string | undefined> = {
          email: headers.find((h) => h.toLowerCase().includes("email")),
          name: headers.find((h) => h.toLowerCase().includes("name")),
          phone: headers.find((h) => h.toLowerCase().includes("phone")),
          company: headers.find((h) => h.toLowerCase().includes("company")),
          position: headers.find((h) => h.toLowerCase().includes("position")),
          linkedin: headers.find((h) => h.toLowerCase().includes("linkedin")),
          status: headers.find((h) => h.toLowerCase().includes("status")),
          tags: headers.find((h) => h.toLowerCase().includes("tag")),
          location: headers.find((h) => h.toLowerCase().includes("location")),
        };

        setFieldMap(map);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      parseCSVFile(file);
    } else if (file) {
      alert("Please select a CSV file only.");
    }
  };

  const processParsedData = () => {
    // Extract email field key for valid,duplicate,invalid emails
    const emailField = fieldMap.email;

    if (!emailField) {
      alert("Email column must be mapped.");
      return;
    }
    const seenEmails = new Set<string>();
    const valids: Lead[] = [];
    const duplicates: Lead[] = [];
    const invalids: Lead[] = [];

    parsedData.forEach((row) => {
      const email = row[emailField]?.toString().trim().toLowerCase();

      const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail) {
        invalids.push(row);
      } else if (seenEmails.has(email)) {
        duplicates.push(row);
      } else {
        seenEmails.add(email);
        valids.push(row);
      }
    });

    setValidLeads(valids);
    setInvalidLeads(invalids);
    setDuplicateLeads(duplicates);
    return true;
  };

  // Drag and Drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];

    if (file && file.type === "text/csv") {
      parseCSVFile(file);
    } else if (file) {
      alert("Please upload a valid CSV file.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="btn-hollow">
          {icon}
          {dialogLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload CSV - Step {step} of 4</DialogTitle>
        </DialogHeader>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s
                      ? "bg-cta text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s !== 4 && (
                  <div
                    className={`h-1 w-16 ${step > s ? "bg-cta" : "bg-muted"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1- Campaign Name */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Campaign Name</h3>
            </div>

            <div>
              <Input
                type="name"
                placeholder="Enter campaign name here"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  if (!campaignName.trim()) {
                    alert("Enter a campaign name first");
                  } else {
                    setStep(2);
                  }
                }}
                className="bg-cta hover:bg-cta-hover text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 – File Upload UI */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-medium-gray mb-6">
                Select a CSV file containing your leads.
              </p>
            </div>

            {!uploadedFileName ? (
              // Show drop area & browse button if no file uploaded
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-cta bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-charcoal">
                    {isDragging
                      ? "Drop your CSV file here"
                      : "Drop your CSV file here"}
                  </p>
                  <p className="text-medium-gray">or</p>
                  <div className="relative inline-block">
                    <input
                      ref={fileInputRef}
                      id="csv-upload"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    />
                    <Button asChild className="btn-1 !p-2 !text-sm">
                      <label
                        htmlFor="csv-upload"
                        className="cursor-pointer w-full h-full flex items-center justify-center"
                      >
                        Browse Files
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Show uploaded file box
              <div className="p-6 border border-green-300 bg-green-50 rounded-lg text-center space-y-2">
                <p className="text-green-700 text-sm font-medium">
                  ✅ <strong>{uploadedFileName}</strong> selected.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedFileName(null);
                    setParsedData([]);
                    setCsvHeaders([]);
                  }}
                >
                  Choose Another File
                </Button>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    CSV Format Requirements
                  </h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• First row should contain column headers</li>
                    <li>• Email column is required</li>
                    <li>• Recommended columns: Email, Full Name, Company</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="bg-cta hover:bg-cta-hover text-white"
                onClick={() => {
                  if (parsedData.length > 0) {
                    setStep(3);
                  } else {
                    alert("Please upload a valid CSV file first.");
                  }
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 – Mapping UI */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Map CSV Columns</h3>
              <p className="text-medium-gray">
                Match your CSV columns to lead fields
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Email Address *", key: "email" },
                { label: "Full Name", key: "name" },
                { label: "Phone", key: "phone" },
                { label: "Company", key: "company" },
                { label: "Position", key: "position" },
                { label: "LinkedIn URL", key: "linkedin" },
                { label: "Tags", key: "tags" },
                { label: "Location", key: "location" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Select defaultValue={fieldMap[key as keyof typeof fieldMap]}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders
                        .filter((header) =>
                          allowedFields.some((key) =>
                            header.toLowerCase().includes(key)
                          )
                        )
                        .map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={() => {
                  const success = processParsedData();
                  if (success) {
                    setStep(4);
                  }
                }}
                className="bg-cta hover:bg-cta-hover text-white"
              >
                Process Upload
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 – Result UI */}
        {step === 4 && (
          <div className="flex flex-col overflow-hidden">
            <div className="text-center mb-6">
              <div className="flex justify-center items-center mb-2">
                <Eye className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold">Preview</h3>
              </div>
              <p className="text-medium-gray">
                Here’s a quick preview of your uploaded leads before finalizing
                the import.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validLeads.length}
                </div>
                <div className="text-sm text-green-700">Leads Imported</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {duplicateLeads.length}
                </div>
                <div className="text-sm text-yellow-700">
                  Duplicates Skipped
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {invalidLeads.length}
                </div>
                <div className="text-sm text-red-700">Invalid Emails</div>
              </div>
            </div>

            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between">
                <h4>
                  Uploaded Leads for{" "}
                  <span className="font-semibold">{campaignName} </span>Campaign
                </h4>
              </div>

              {/* Scrollable Table */}
              <div className="border rounded-lg overflow-auto max-h-[25vh]">
                <Table>
                  <TableHeader className="bg-muted text-muted-foreground">
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>LinkedIn</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow key={index}>
                        {[
                          fieldMap.email,
                          fieldMap.name,
                          fieldMap.phone,
                          fieldMap.company,
                          fieldMap.position,
                          fieldMap.linkedin,
                          fieldMap.status,
                          fieldMap.tags,
                          fieldMap.location,
                        ].map((field, i) => (
                          <TableCell
                            key={i}
                            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                          >
                            {row[field || ""]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              {/* <Button variant="outline" onClick={() => setStep(1)}>
                Upload More
              </Button> */}
              <Button
                className="bg-cta hover:bg-cta-hover text-white"
                onClick={() => {
                  console.log(parsedData); //full uploaded data
                  setUploadedFileName(null);
                  setParsedData([]);
                  setCsvHeaders([]);
                  setStep(1);
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
