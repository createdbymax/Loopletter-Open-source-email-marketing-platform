"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getOrCreateArtistByClerkId, getTemplatesByArtist, getPublicTemplates, createTemplate, } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Layout, Eye, Copy, Edit, Trash2, MoreHorizontal, Mail, Music, Calendar, ShoppingBag, Newspaper, Heart, Palette, Code, Sparkles, } from "lucide-react";
import type { Template, TemplateVariable } from "@/lib/types";
import { SpotifyTemplateGenerator } from "@/components/spotify-template-generator";
const TEMPLATE_CATEGORIES = [
    { value: "music_release", label: "Music Release", icon: Music },
    { value: "show_announcement", label: "Show Announcement", icon: Calendar },
    { value: "merchandise", label: "Merchandise", icon: ShoppingBag },
    { value: "newsletter", label: "Newsletter", icon: Newspaper },
    { value: "welcome", label: "Welcome", icon: Heart },
    { value: "custom", label: "Custom", icon: Layout },
];
const VARIABLE_TYPES = [
    { value: "text", label: "Text" },
    { value: "image", label: "Image URL" },
    { value: "url", label: "Link URL" },
    { value: "color", label: "Color" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "True/False" },
];
function TemplateBuilder({ template, onSave, onCancel, }: {
    template?: Template;
    onSave: (data: {
        name: string;
        description: string;
        category: Template["category"];
        html_content: string;
        variables: TemplateVariable[];
        is_public: boolean;
    }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(template?.name || "");
    const [description, setDescription] = useState(template?.description || "");
    const [category, setCategory] = useState<Template["category"]>(template?.category || "custom");
    const [htmlContent, setHtmlContent] = useState(template?.html_content || "");
    const [variables, setVariables] = useState<TemplateVariable[]>(template?.variables || []);
    const [isPublic, setIsPublic] = useState(template?.is_public || false);
    const addVariable = () => {
        setVariables([
            ...variables,
            {
                name: "",
                type: "text",
                label: "",
                default_value: "",
                required: false,
            },
        ]);
    };
    const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
        const newVariables = [...variables];
        newVariables[index] = { ...newVariables[index], ...updates };
        setVariables(newVariables);
    };
    const removeVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index));
    };
    const handleSave = () => {
        if (!name.trim() || !htmlContent.trim())
            return;
        onSave({
            name: name.trim(),
            description: description.trim(),
            category,
            html_content: htmlContent,
            variables: variables.filter((v) => v.name && v.label),
            is_public: isPublic,
        });
    };
    const insertVariable = (varName: string) => {
        const cursorPos = (document.getElementById("html-editor") as HTMLTextAreaElement)
            ?.selectionStart || 0;
        const before = htmlContent.substring(0, cursorPos);
        const after = htmlContent.substring(cursorPos);
        setHtmlContent(before + `{{${varName}}}` + after);
    };
    return (<div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Template Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., New Release Announcement"/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Select value={category} onValueChange={(value: any) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-4 h-4"/>
                    {cat.label}
                  </div>
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Description (Optional)
        </label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this template..." rows={2}/>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">HTML Editor</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              HTML Content
            </label>
            <Textarea id="html-editor" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} placeholder="Enter your HTML template..." rows={20} className="font-mono text-sm"/>
          </div>

          {variables.length > 0 && (<div>
              <label className="block text-sm font-medium mb-2">
                Insert Variables
              </label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable, index) => variable.name && (<Button key={index} variant="outline" size="sm" onClick={() => insertVariable(variable.name)}>
                        {variable.name}
                      </Button>))}
              </div>
            </div>)}
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Template Variables</h3>
            <Button variant="outline" size="sm" onClick={addVariable}>
              <Plus className="w-4 h-4 mr-2"/>
              Add Variable
            </Button>
          </div>

          <div className="space-y-3">
            {variables.map((variable, index) => (<Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Variable Name
                      </label>
                      <Input value={variable.name} onChange={(e) => updateVariable(index, { name: e.target.value })} placeholder="e.g., song_title"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Label
                      </label>
                      <Input value={variable.label} onChange={(e) => updateVariable(index, { label: e.target.value })} placeholder="e.g., Song Title"/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Type
                      </label>
                      <Select value={variable.type} onValueChange={(value: any) => updateVariable(index, { type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VARIABLE_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Default Value
                      </label>
                      <Input value={variable.default_value?.toString() || ""} onChange={(e) => updateVariable(index, {
                default_value: e.target.value,
            })} placeholder="Default value..."/>
                    </div>

                    <div className="col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={variable.required} onChange={(e) => updateVariable(index, {
                required: e.target.checked,
            })}/>
                        <span className="text-sm">Required field</span>
                      </label>

                      <Button variant="ghost" size="sm" onClick={() => removeVariable(index)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>))}

            {variables.length === 0 && (<div className="text-center py-8 text-gray-500 dark:text-neutral-400">
                No variables defined. Add variables to make your template
                dynamic.
              </div>)}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="border dark:border-neutral-700 rounded-lg p-4 bg-gray-50 dark:bg-neutral-800">
            <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">
              Template Preview
            </h3>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded border dark:border-neutral-700" dangerouslySetInnerHTML={{
            __html: htmlContent ||
                '<p class="text-gray-500 dark:text-neutral-400">No content to preview</p>',
        }}/>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}/>
          <span className="text-sm">Make this template public</span>
        </label>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !htmlContent.trim()}>
            {template ? "Update" : "Create"} Template
          </Button>
        </div>
      </div>
    </div>);
}
function TemplateCard({ template, onEdit, onDuplicate, onDelete, }: {
    template: Template;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const categoryInfo = TEMPLATE_CATEGORIES.find((c) => c.value === template.category);
    const CategoryIcon = categoryInfo?.icon || Layout;
    return (<Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-neutral-400"/>
            <Badge variant="outline">
              {categoryInfo?.label || template.category}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2"/>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2"/>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2"/>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        {template.description && (<p className="text-sm text-gray-600 dark:text-neutral-400">
            {template.description}
          </p>)}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded text-xs">
            <div dangerouslySetInnerHTML={{
            __html: template.html_content.substring(0, 200) + "...",
        }}/>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-neutral-400">
            <span>{template.variables.length} variables</span>
            <span>{new Date(template.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Eye className="w-4 h-4 mr-2"/>
              Preview
            </Button>
            <Button size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2"/>
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>);
}
export function TemplateManager() {
    const { user, isLoaded } = useUser();
    const [artist, setArtist] = useState<any>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBuilder, setShowBuilder] = useState(false);
    const [showSpotifyGenerator, setShowSpotifyGenerator] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [activeTab, setActiveTab] = useState("my-templates");
    useEffect(() => {
        async function fetchData() {
            if (!user)
                return;
            setLoading(true);
            try {
                const a = await getOrCreateArtistByClerkId(user.id, user.primaryEmailAddress?.emailAddress || "", user.fullName || user.username || "Artist");
                setArtist(a);
                const [templatesData, publicTemplatesData] = await Promise.all([
                    getTemplatesByArtist(a.id),
                    getPublicTemplates(),
                ]);
                setTemplates(templatesData);
                setPublicTemplates(publicTemplatesData);
            }
            catch (error) {
                console.error("Error fetching templates:", error);
            }
            finally {
                setLoading(false);
            }
        }
        if (isLoaded)
            fetchData();
    }, [user, isLoaded]);
    const handleCreateTemplate = async (data: {
        name: string;
        description: string;
        category: Template["category"];
        html_content: string;
        variables: TemplateVariable[];
        is_public: boolean;
    }) => {
        if (!artist)
            return;
        try {
            const newTemplate = await createTemplate({
                ...data,
                artist_id: artist.id,
            });
            setTemplates([newTemplate, ...templates]);
            setShowBuilder(false);
        }
        catch (error) {
            console.error("Error creating template:", error);
            alert("Failed to create template");
        }
    };
    const handleDuplicateTemplate = async (template: Template) => {
        if (!artist)
            return;
        try {
            const duplicatedTemplate = await createTemplate({
                ...template,
                name: `${template.name} (Copy)`,
                artist_id: artist.id,
                is_public: false,
            });
            setTemplates([duplicatedTemplate, ...templates]);
        }
        catch (error) {
            console.error("Error duplicating template:", error);
            alert("Failed to duplicate template");
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-neutral-100"></div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Email Templates
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            Create and manage reusable email templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setShowSpotifyGenerator(true)}>
            <Sparkles className="w-4 h-4 mr-2"/>
            Generate from Spotify
          </Button>
          <Button type="button" onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2"/>
            Create Template
          </Button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Templates</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Public Templates
            </CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicTemplates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates
            .find((t) => t.category === "music_release")
            ?.name.substring(0, 10) || "None"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map((t) => t.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="public-templates">Public Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-templates" className="space-y-4">
          {templates.length === 0 ? (<Card>
              <CardContent className="text-center py-12">
                <Layout className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
                  No templates yet
                </h3>
                <p className="text-gray-600 dark:text-neutral-400 mb-6">
                  Create your first email template to get started
                </p>
                <div className="flex gap-3 justify-center">
                  <Button type="button" variant="outline" onClick={() => setShowSpotifyGenerator(true)}>
                    <Sparkles className="w-4 h-4 mr-2"/>
                    Generate from Spotify
                  </Button>
                  <Button type="button" onClick={() => setShowBuilder(true)}>
                    <Plus className="w-4 h-4 mr-2"/>
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (<TemplateCard key={template.id} template={template} onEdit={() => setEditingTemplate(template)} onDuplicate={() => handleDuplicateTemplate(template)} onDelete={() => {
                    if (confirm("Are you sure you want to delete this template?")) {
                    }
                }}/>))}
            </div>)}
        </TabsContent>

        <TabsContent value="public-templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTemplates.map((template) => (<TemplateCard key={template.id} template={template} onEdit={() => handleDuplicateTemplate(template)} onDuplicate={() => handleDuplicateTemplate(template)} onDelete={() => { }}/>))}
          </div>
        </TabsContent>
      </Tabs>

      
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <TemplateBuilder onSave={handleCreateTemplate} onCancel={() => setShowBuilder(false)}/>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showSpotifyGenerator} onOpenChange={setShowSpotifyGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Template from Spotify</DialogTitle>
          </DialogHeader>
          <SpotifyTemplateGenerator onTemplateGenerated={(template: any) => {
            setTemplates([template, ...templates]);
            setShowSpotifyGenerator(false);
        }}/>
        </DialogContent>
      </Dialog>

      
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (<TemplateBuilder template={editingTemplate} onSave={(data) => {
                console.log("Update template:", data);
                setEditingTemplate(null);
            }} onCancel={() => setEditingTemplate(null)}/>)}
        </DialogContent>
      </Dialog>
    </div>);
}
