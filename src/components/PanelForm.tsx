import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Panel, PanelStatus, Project, Building } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PanelFormProps {
  panel?: Panel;
  projects: Project[];
  buildings: Building[];
  onSubmit: (data: Partial<Panel>) => void;
  isSubmitting?: boolean;
}

// Define status as a literal union type to match PanelStatus
const panelSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  name: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  projectId: z.string().min(1, "Project is required"),
  buildingId: z.string().optional(),
  weight: z.coerce.number().min(0, "Weight must be 0 or greater"),
  dimensions: z.object({
    width: z.coerce.number().min(0, "Width must be 0 or greater"),
    height: z.coerce.number().min(0, "Height must be 0 or greater"),
    thickness: z.coerce.number().min(0, "Thickness must be 0 or greater"),
  }),
  status: z.enum([
    "manufactured", 
    "delivered", 
    "installed", 
    "inspected", 
    "rejected", 
    "issued", 
    "held", 
    "produced", 
    "prepared", 
    "returned",
    "rejected_material",
    "approved_material",
    "checked",
    "approved_final",
    "cancelled",
    "proceed_delivery",
    "broken_site"
  ] as const), // Using const to enforce literal types
  date: z.string().optional(),
  issueTransmittalNo: z.string().optional(),
  dwgNo: z.string().optional(),
  description: z.string().optional(),
  panelTag: z.string().optional(),
  unitQty: z.coerce.number().optional(),
  unitQtyType: z.enum(["sqm", "lm"]).optional(),
  ifpQtyNos: z.coerce.number().optional(),
  ifpQtyMeasurement: z.coerce.number().optional(),
  draftman: z.string().optional(),
  checkedBy: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  qrCodeImage: z.string().optional(),
});

const PanelForm: React.FC<PanelFormProps> = ({
  panel,
  projects,
  buildings,
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm<z.infer<typeof panelSchema>>({
    resolver: zodResolver(panelSchema),
    defaultValues: panel
      ? {
          serialNumber: panel.serialNumber,
          name: panel.name || "",
          type: panel.type,
          projectId: panel.projectId,
          buildingId: panel.buildingId || "",
          weight: panel.weight,
          dimensions: panel.dimensions,
          status: panel.status,
          date: panel.date || "",
          issueTransmittalNo: panel.issueTransmittalNo || "",
          dwgNo: panel.dwgNo || "",
          description: panel.description || "",
          panelTag: panel.panelTag || "",
          unitQty: panel.unitQty || undefined,
          unitQtyType: panel.unitQtyType || "sqm",
          ifpQtyNos: panel.ifpQtyNos || undefined,
          ifpQtyMeasurement: panel.ifpQtyMeasurement || undefined,
          draftman: panel.draftman || "",
          checkedBy: panel.checkedBy || "",
          notes: panel.notes || "",
          location: panel.location || "",
          qrCodeImage: panel.qrCodeImage || "",
        }
      : {
          serialNumber: "",
          name: "",
          type: "",
          projectId: "",
          buildingId: "",
          weight: 0,
          dimensions: {
            width: 0,
            height: 0,
            thickness: 0,
          },
          status: "manufactured" as PanelStatus, // Type assertion to ensure it's PanelStatus
          date: "",
          issueTransmittalNo: "",
          dwgNo: "",
          description: "",
          panelTag: "",
          unitQtyType: "sqm",
          location: "",
        },
  });

  const projectId = form.watch("projectId");
  const filteredBuildings = buildings.filter((b) => b.projectId === projectId);

  const handleSubmit = (data: z.infer<typeof panelSchema>) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter serial number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter panel name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter panel type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manufactured">Manufactured</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="installed">Installed</SelectItem>
                        <SelectItem value="inspected">Inspected</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="issued">Issued</SelectItem>
                        <SelectItem value="held">Held</SelectItem>
                        <SelectItem value="produced">Produced</SelectItem>
                        <SelectItem value="proceed_delivery">Proceed Delivery</SelectItem>
                        <SelectItem value="approved_material">Approved Material</SelectItem>
                        <SelectItem value="rejected_material">Rejected Material</SelectItem>
                        <SelectItem value="checked">Checked</SelectItem>
                        <SelectItem value="approved_final">Approved Final</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="broken_site">Broken Site</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("buildingId", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!projectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={projectId ? "Select building" : "Select project first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Building</SelectItem>
                        {filteredBuildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Current location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="issueTransmittalNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue / Transmittal Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., TN-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dwgNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drawing Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., KSP-FS-101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panelTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel Tag</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., OH-UC-101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="draftman"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Draftman</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name of draftman" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Checked By</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name of checker" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dimensions and Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimensions and Measurements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dimensions.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (mm) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (mm) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions.thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thickness (mm) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="unitQtyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Quantity Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sqm">SQM</SelectItem>
                        <SelectItem value="lm">LM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifpQtyNos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFP Quantity (Nos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifpQtyMeasurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFP (m²/LM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === undefined ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about the panel"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="qrCodeImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QR Code Image URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          {...field}
                          placeholder="URL to QR code image"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                        >
                          <QrCode className="h-5 w-5" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("qrCodeImage") && (
                <div className="border rounded p-4 flex justify-center">
                  <img 
                    src={form.watch("qrCodeImage")} 
                    alt="QR Code Preview"
                    className="max-h-32 object-contain" 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : panel ? "Update Panel" : "Create Panel"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PanelForm;
