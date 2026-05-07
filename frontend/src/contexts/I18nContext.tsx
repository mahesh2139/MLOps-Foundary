import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageType = 'en' | 'es' | 'fr' | 'de';

interface Translations {
  [key: string]: {
    [lang: string]: string;
  };
}

const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', es: 'Panel', fr: 'Tableau de bord', de: 'Armaturenbrett' },
  projects: { en: 'Projects', es: 'Proyectos', fr: 'Projets', de: 'Projekte' },
  dataIngestion: { en: 'Data Ingestion', es: 'Ingesta de Datos', fr: 'Ingestion de Données', de: 'Datenerfassung' },
  dataPreparation: { en: 'Data Preparation', es: 'Preparación de Datos', fr: 'Préparation des Données', de: 'Datenvorbereitung' },
  modelRegistry: { en: 'Model Registry', es: 'Registro de Modelos', fr: 'Registre des Modèles', de: 'Modellregister' },
  deployment: { en: 'Deployment', es: 'Despliegue', fr: 'Déploiement', de: 'Bereitstellung' },
  inferencing: { en: 'Inferencing', es: 'Inferencia', fr: 'Inférence', de: 'Inferencing' },
  monitoring: { en: 'Monitoring', es: 'Monitoreo', fr: 'Surveillance', de: 'Überwachung' },
  pipelines: { en: 'Pipelines', es: 'Tuberías', fr: 'Pipelines', de: 'Pipelines' },
  integrations: { en: 'Integrations', es: 'Integraciones', fr: 'Intégrations', de: 'Integrationen' },
  admin: { en: 'Admin', es: 'Administrador', fr: 'Admin', de: 'Admin' },
  
  // Common actions
  create: { en: 'Create', es: 'Crear', fr: 'Créer', de: 'Erstellen' },
  delete: { en: 'Delete', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen' },
  edit: { en: 'Edit', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten' },
  save: { en: 'Save', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen' },
  search: { en: 'Search', es: 'Buscar', fr: 'Rechercher', de: 'Suche' },
  
  // Theme & Language
  lightMode: { en: 'Light', es: 'Claro', fr: 'Clair', de: 'Hell' },
  darkMode: { en: 'Dark', es: 'Oscuro', fr: 'Sombre', de: 'Dunkel' },
  language: { en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache' },
  
  // Auth
  login: { en: 'Login', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden' },
  signup: { en: 'Sign Up', es: 'Registrarse', fr: "S'inscrire", de: 'Registrieren' },
  email: { en: 'Email', es: 'Correo electrónico', fr: 'E-mail', de: 'E-Mail' },
  password: { en: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort' },
  name: { en: 'Full Name', es: 'Nombre Completo', fr: 'Nom complet', de: 'Vollständiger Name' },
  confirmPassword: { en: 'Confirm Password', es: 'Confirmar Contraseña', fr: 'Confirmer le mot de passe', de: 'Passwort bestätigen' },
  dontHaveAccount: { en: "Don't have an account?", es: '¿No tienes una cuenta?', fr: "Vous n'avez pas de compte?", de: 'Noch kein Konto?' },
  alreadyHaveAccount: { en: 'Already have an account?', es: '¿Ya tienes una cuenta?', fr: 'Vous avez déjà un compte?', de: 'Sie haben bereits ein Konto?' },
  invalidEmail: { en: 'Invalid email format', es: 'Formato de correo electrónico no válido', fr: 'Format d\'email invalide', de: 'Ungültiges E-Mail-Format' },
  passwordMismatch: { en: 'Passwords do not match', es: 'Las contraseñas no coinciden', fr: 'Les mots de passe ne correspondent pas', de: 'Passwörter stimmen nicht überein' },
  signupSuccess: { en: 'Account created successfully!', es: '¡Cuenta creada exitosamente!', fr: 'Compte créé avec succès!', de: 'Konto erfolgreich erstellt!' },
  
  // Projects & Files
  newProject: { en: 'New Project', es: 'Nuevo Proyecto', fr: 'Nouveau Projet', de: 'Neues Projekt' },
  newFile: { en: 'New File', es: 'Nuevo Archivo', fr: 'Nouveau Fichier', de: 'Neue Datei' },
  newFolder: { en: 'New Folder', es: 'Nueva Carpeta', fr: 'Nouveau Dossier', de: 'Neuer Ordner' },
  addCell: { en: 'Add Cell', es: 'Agregar Celda', fr: 'Ajouter une cellule', de: 'Zelle hinzufügen' },
  deleteCell: { en: 'Delete Cell', es: 'Eliminar Celda', fr: 'Supprimer la cellule', de: 'Zelle löschen' },
  codeCell: { en: 'Code', es: 'Código', fr: 'Code', de: 'Code' },
  markdownCell: { en: 'Markdown', es: 'Markdown', fr: 'Markdown', de: 'Markdown' },
  
  // Pipelines
  newPipeline: { en: 'New Pipeline', es: 'Nueva Tubería', fr: 'Nouveau Pipeline', de: 'Neue Pipeline' },
  addJob: { en: 'Add Job', es: 'Agregar Trabajo', fr: 'Ajouter un travail', de: 'Aufgabe hinzufügen' },
  addApproval: { en: 'Add Approval', es: 'Agregar Aprobación', fr: 'Ajouter une approbation', de: 'Genehmigung hinzufügen' },
  runPipeline: { en: 'Run Pipeline', es: 'Ejecutar Tubería', fr: 'Exécuter le Pipeline', de: 'Pipeline ausführen' },
};

interface I18nContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const stored = localStorage.getItem('language') as LanguageType | null;
    return stored || 'en';
  });

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Dispatch custom event for external listeners
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
