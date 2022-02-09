-- Copyright (c) 2020, UW Medicine Research IT, University of Washington
-- Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
-- This Source Code Form is subject to the terms of the Mozilla Public
-- License, v. 2.0. If a copy of the MPL was not distributed with this
-- file, You can obtain one at http://mozilla.org/MPL/2.0/.

INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (-1, N'Dynamic', N'{"fields":[]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (1, N'Observation', N'{"fields":[{"name":"category","type":"String","phi":false,"mask":false,"required":true},{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"effectiveDate","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"referenceRangeLow","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"referenceRangeHigh","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"specimenType","type":"String","phi":false,"mask":false,"required":false},{"name":"valueString","type":"String","phi":false,"mask":false,"required":true},{"name":"valueQuantity","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"valueUnit","type":"String","phi":false,"mask":false,"required":false},{"name":"personId","type":"String","phi":true,"mask":true,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (2, N'Encounter', N'{"fields":[{"name":"admitDate","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"admitSource","type":"String","phi":false,"mask":false,"required":false},{"name":"class","type":"String","phi":false,"mask":false,"required":true},{"name":"dischargeDate","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"dischargeDisposition","type":"String","phi":false,"mask":false,"required":false},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"location","type":"String","phi":false,"mask":false,"required":true},{"name":"status","type":"String","phi":false,"mask":false,"required":false},{"name":"personId","type":"String","phi":true,"mask":true,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (3, N'Demographic', N'{"fields":[{"name":"addressPostalCode","type":"String","phi":false,"mask":false,"required":true},{"name":"addressState","type":"String","phi":false,"mask":false,"required":true},{"name":"ethnicity","type":"String","phi":false,"mask":false,"required":true},{"name":"gender","type":"String","phi":false,"mask":false,"required":true},{"name":"language","type":"String","phi":false,"mask":false,"required":true},{"name":"maritalStatus","type":"String","phi":false,"mask":false,"required":true},{"name":"race","type":"String","phi":false,"mask":false,"required":true},{"name":"religion","type":"String","phi":false,"mask":false,"required":true},{"name":"marriedBoolean","type":"Bool","phi":false,"mask":false,"required":true},{"name":"hispanicBoolean","type":"Bool","phi":false,"mask":false,"required":true},{"name":"deceasedBoolean","type":"Bool","phi":false,"mask":false,"required":true},{"name":"birthDate","type":"DateTime","phi":true,"mask":true,"required":false},{"name":"deceasedDateTime","type":"DateTime","phi":true,"mask":true,"required":false},{"name":"name","type":"String","phi":true,"mask":false,"required":false},{"name":"mrn","type":"String","phi":true,"mask":false,"required":false},{"name":"personId","type":"String","phi":true,"mask":true,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (4, N'Condition', N'{"fields":[{"name":"abatementDateTime","type":"DateTime","phi":true,"mask":true,"required":false},{"name":"category","type":"String","phi":false,"mask":false,"required":true},{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"onsetDateTime","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"recordedDate","type":"DateTime","phi":true,"mask":true,"required":false},{"name":"text","type":"String","phi":false,"mask":false,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (5, N'Procedure', N'{"fields":[{"name":"category","type":"String","phi":false,"mask":false,"required":true},{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"performedDateTime","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"text","type":"String","phi":false,"mask":false,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (6, N'Immunization', N'{"fields":[{"name":"vaccineCode","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"doseQuantity","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"doseUnit","type":"String","phi":false,"mask":false,"required":false},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"occurrenceDateTime","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"route","type":"String","phi":false,"mask":false,"required":false},{"name":"text","type":"String","phi":false,"mask":false,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (7, N'Allergy', N'{"fields":[{"name":"category","type":"String","phi":false,"mask":false,"required":true},{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"onsetDateTime","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"recordedDate","type":"DateTime","phi":true,"mask":true,"required":false},{"name":"text","type":"String","phi":false,"mask":false,"required":true}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (8, N'MedicationRequest', N'{"fields":[{"name":"amount","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"authoredOn","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"form","type":"String","phi":false,"mask":false,"required":false},{"name":"text","type":"String","phi":false,"mask":false,"required":true},{"name":"unit","type":"String","phi":false,"mask":false,"required":false}]}')
INSERT [ref].[Shape] ([Id], [Variant], [Schema]) VALUES (9, N'MedicationAdministration', N'{"fields":[{"name":"code","type":"String","phi":false,"mask":false,"required":true},{"name":"coding","type":"String","phi":false,"mask":false,"required":true},{"name":"doseQuantity","type":"Numeric","phi":false,"mask":false,"required":false},{"name":"doseUnit","type":"String","phi":false,"mask":false,"required":false},{"name":"encounterId","type":"String","phi":true,"mask":true,"required":true},{"name":"effectiveDateTime","type":"DateTime","phi":true,"mask":true,"required":true},{"name":"route","type":"String","phi":false,"mask":false,"required":false},{"name":"text","type":"String","phi":false,"mask":false,"required":true}]}')

SET IDENTITY_INSERT [auth].[Constraint] ON 
INSERT [auth].[Constraint] ([Id], [Type]) VALUES (1, N'User')
INSERT [auth].[Constraint] ([Id], [Type]) VALUES (2, N'Group')
SET IDENTITY_INSERT [auth].[Constraint] OFF

INSERT [ref].[SessionType] ([Id], [Variant]) VALUES (1, N'QI')
INSERT [ref].[SessionType] ([Id], [Variant]) VALUES (2, N'Research')

INSERT [ref].[ImportType] ([Id], [Variant]) VALUES (1, N'REDCap Project')
INSERT [ref].[ImportType] ([Id], [Variant]) VALUES (2, N'MRN')

INSERT INTO [network].[Identity] ([Lock], [Name], [Abbreviation], [Description], [TotalPatients], [Latitude], [Longitude], [PrimaryColor], [SecondaryColor])
SELECT 
    [Lock] = 'X'
   ,[Name] = 'University of Example'
   ,[Abbreviation] = 'UE'
   ,[Description] = 'The University of Example Medical Center is a large medical system representing two hospitals and over 400 regional clinics.'
   ,[TotalPatients] = 2200000
   ,[Latitude] = 47.6062
   ,[Longitude] = 122.3321
   ,[PrimaryColor] = 'rgb(75, 46, 131)'
   ,[SecondaryColor] = 'rgb(183, 165, 122)'

INSERT INTO [ref].[Version] (Lock, [Version])
SELECT 'X', N'3.11.0';

INSERT INTO app.ServerState (Lock, IsUp, Updated, UpdatedBy)
SELECT 'X', 1, GETDATE(), 'Leaf Initialization Script'